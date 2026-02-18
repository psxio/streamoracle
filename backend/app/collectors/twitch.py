import asyncio
import logging
import math
import time
from collections import Counter
from datetime import datetime

import httpx
import websockets

from app.collectors.base import AbstractCollector
from app.config import settings
from app.utils.rate_limiter import RateLimiter

logger = logging.getLogger(__name__)


class TwitchCollector(AbstractCollector):
    """Collects data from Twitch using the Helix API and IRC WebSocket."""

    HELIX_BASE = "https://api.twitch.tv/helix"
    TOKEN_URL = "https://id.twitch.tv/oauth2/token"
    IRC_URL = "wss://irc-ws.chat.twitch.tv:443"

    def __init__(self):
        self._access_token: str | None = None
        self._token_expires_at: float = 0
        self._rate_limiter = RateLimiter(rate=800 / 60, capacity=800)
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=15.0)
        return self._client

    async def _ensure_token(self):
        if self._access_token and time.time() < self._token_expires_at - 60:
            return
        if not settings.TWITCH_CLIENT_ID or not settings.TWITCH_CLIENT_SECRET:
            logger.warning("Twitch credentials not configured, skipping token refresh")
            return
        client = await self._get_client()
        resp = await client.post(
            self.TOKEN_URL,
            params={
                "client_id": settings.TWITCH_CLIENT_ID,
                "client_secret": settings.TWITCH_CLIENT_SECRET,
                "grant_type": "client_credentials",
            },
        )
        resp.raise_for_status()
        data = resp.json()
        self._access_token = data["access_token"]
        self._token_expires_at = time.time() + data.get("expires_in", 3600)
        logger.info("Twitch access token refreshed")

    def _headers(self) -> dict:
        return {
            "Client-ID": settings.TWITCH_CLIENT_ID,
            "Authorization": f"Bearer {self._access_token}",
        }

    async def _helix_get(self, endpoint: str, params: dict | None = None) -> dict:
        await self._ensure_token()
        await self._rate_limiter.acquire()
        client = await self._get_client()
        resp = await client.get(
            f"{self.HELIX_BASE}{endpoint}",
            headers=self._headers(),
            params=params,
        )
        resp.raise_for_status()
        return resp.json()

    async def collect_channel_info(self, username: str) -> dict:
        user_data = await self._helix_get("/users", {"login": username})
        if not user_data.get("data"):
            return {}
        user = user_data["data"][0]

        channel_data = await self._helix_get(
            "/channels", {"broadcaster_id": user["id"]}
        )
        channel = channel_data["data"][0] if channel_data.get("data") else {}

        follower_data = await self._helix_get(
            "/channels/followers", {"broadcaster_id": user["id"], "first": 1}
        )
        follower_count = follower_data.get("total", 0)

        return {
            "platform": "twitch",
            "platform_id": user["id"],
            "username": user["login"],
            "display_name": user["display_name"],
            "avatar_url": user.get("profile_image_url"),
            "category": channel.get("game_name"),
            "follower_count": follower_count,
        }

    async def collect_viewers(self, username: str) -> dict:
        stream_data = await self._helix_get("/streams", {"user_login": username})
        if not stream_data.get("data"):
            return {"viewer_count": 0, "chatter_count": 0, "is_live": False}

        stream = stream_data["data"][0]
        viewer_count = stream.get("viewer_count", 0)

        chatter_count = 0
        try:
            user_data = await self._helix_get("/users", {"login": username})
            if user_data.get("data"):
                broadcaster_id = user_data["data"][0]["id"]
                chatter_data = await self._helix_get(
                    "/chat/chatters",
                    {"broadcaster_id": broadcaster_id, "moderator_id": broadcaster_id},
                )
                chatter_count = chatter_data.get("total", 0)
        except Exception as e:
            logger.warning("Failed to get chatter count for %s: %s", username, e)

        return {
            "viewer_count": viewer_count,
            "chatter_count": chatter_count,
            "is_live": True,
            "category": stream.get("game_name"),
        }

    async def collect_chat_metrics(
        self, username: str, duration_seconds: int = 60
    ) -> dict:
        messages: list[dict] = []
        start_time = time.time()

        try:
            async with websockets.connect(self.IRC_URL) as ws:
                await ws.send("CAP REQ :twitch.tv/tags")
                await ws.send("PASS SCHMOOPIIE")
                await ws.send("NICK justinfan12345")
                await ws.send(f"JOIN #{username.lower()}")

                while time.time() - start_time < duration_seconds:
                    try:
                        raw = await asyncio.wait_for(ws.recv(), timeout=2.0)
                        if "PRIVMSG" in raw:
                            parts = raw.split("PRIVMSG", 1)
                            text = parts[1].split(":", 1)[1].strip() if len(parts) > 1 and ":" in parts[1] else ""
                            user_part = raw.split("!", 0)[0] if "!" in raw else "unknown"
                            nick = user_part.lstrip(":").split("!")[0] if "!" in user_part else "unknown"
                            messages.append({
                                "user": nick,
                                "text": text,
                                "time": time.time(),
                            })
                        elif raw.startswith("PING"):
                            await ws.send(raw.replace("PING", "PONG"))
                    except asyncio.TimeoutError:
                        continue
        except Exception as e:
            logger.warning("IRC collection error for %s: %s", username, e)

        return self._compute_chat_metrics(messages, start_time)

    def _compute_chat_metrics(self, messages: list[dict], start_time: float) -> dict:
        if not messages:
            return {
                "message_count": 0,
                "unique_chatters": 0,
                "message_entropy": 0.0,
                "unique_message_ratio": 0.0,
                "avg_time_between_msgs": 0.0,
                "window_start": datetime.utcnow(),
                "window_end": datetime.utcnow(),
            }

        unique_users = set(m["user"] for m in messages)
        texts = [m["text"] for m in messages]
        total = len(texts)

        # Shannon entropy of message text
        counter = Counter(texts)
        entropy = 0.0
        for count in counter.values():
            p = count / total
            if p > 0:
                entropy -= p * math.log2(p)

        unique_ratio = len(counter) / total if total > 0 else 0.0

        # Average time between messages
        times = sorted(m["time"] for m in messages)
        if len(times) > 1:
            gaps = [times[i + 1] - times[i] for i in range(len(times) - 1)]
            avg_gap = sum(gaps) / len(gaps)
        else:
            avg_gap = 0.0

        return {
            "message_count": total,
            "unique_chatters": len(unique_users),
            "message_entropy": round(entropy, 4),
            "unique_message_ratio": round(unique_ratio, 4),
            "avg_time_between_msgs": round(avg_gap, 4),
            "window_start": datetime.utcfromtimestamp(start_time),
            "window_end": datetime.utcnow(),
        }
