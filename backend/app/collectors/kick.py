import asyncio
import json
import logging
import math
import time
from collections import Counter
from datetime import datetime

import httpx
import websockets

from app.collectors.base import AbstractCollector
from app.utils.rate_limiter import RateLimiter

logger = logging.getLogger(__name__)


class KickCollector(AbstractCollector):
    """Collects data from Kick.com (no auth required)."""

    API_BASE = "https://kick.com/api/v2/channels"
    PUSHER_URL = "wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.4.0&flash=false"

    def __init__(self):
        self._rate_limiter = RateLimiter(rate=2, capacity=5)
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=15.0,
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/json",
                },
            )
        return self._client

    async def _api_get(self, path: str) -> dict:
        await self._rate_limiter.acquire()
        client = await self._get_client()
        try:
            resp = await client.get(f"{self.API_BASE}/{path}")
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 403:
                logger.warning("Kick API returned 403 (Cloudflare block) for %s", path)
                return {}
            raise

    async def collect_channel_info(self, username: str) -> dict:
        data = await self._api_get(username)
        if not data:
            return {}

        user = data.get("user", {})
        return {
            "platform": "kick",
            "platform_id": str(data.get("id", "")),
            "username": data.get("slug", username),
            "display_name": user.get("username", username),
            "avatar_url": user.get("profile_pic"),
            "category": data.get("recent_categories", [{}])[0].get("name")
            if data.get("recent_categories")
            else None,
            "follower_count": data.get("followers_count", 0),
        }

    async def collect_viewers(self, username: str) -> dict:
        data = await self._api_get(username)
        if not data:
            return {"viewer_count": 0, "chatter_count": 0, "is_live": False}

        livestream = data.get("livestream")
        if not livestream:
            return {"viewer_count": 0, "chatter_count": 0, "is_live": False}

        return {
            "viewer_count": livestream.get("viewer_count", 0),
            "chatter_count": 0,
            "is_live": True,
            "category": livestream.get("categories", [{}])[0].get("name")
            if livestream.get("categories")
            else None,
        }

    async def collect_chat_metrics(
        self, username: str, duration_seconds: int = 60
    ) -> dict:
        # Get channel info to find chatroom ID
        data = await self._api_get(username)
        if not data:
            return self._empty_metrics()

        chatroom_id = data.get("chatroom", {}).get("id")
        if not chatroom_id:
            return self._empty_metrics()

        messages: list[dict] = []
        start_time = time.time()

        try:
            async with websockets.connect(self.PUSHER_URL) as ws:
                # Subscribe to chatroom channel
                subscribe_msg = json.dumps(
                    {
                        "event": "pusher:subscribe",
                        "data": {"channel": f"chatrooms.{chatroom_id}.v2"},
                    }
                )
                await ws.send(subscribe_msg)

                while time.time() - start_time < duration_seconds:
                    try:
                        raw = await asyncio.wait_for(ws.recv(), timeout=2.0)
                        event_data = json.loads(raw)
                        if event_data.get("event") == "App\\Events\\ChatMessageEvent":
                            msg_data = json.loads(event_data.get("data", "{}"))
                            messages.append(
                                {
                                    "user": msg_data.get("sender", {}).get(
                                        "username", "unknown"
                                    ),
                                    "text": msg_data.get("content", ""),
                                    "time": time.time(),
                                }
                            )
                        elif event_data.get("event") == "pusher:ping":
                            await ws.send(
                                json.dumps({"event": "pusher:pong", "data": {}})
                            )
                    except asyncio.TimeoutError:
                        continue
        except Exception as e:
            logger.warning("Kick chat collection error for %s: %s", username, e)

        return self._compute_metrics(messages, start_time)

    def _empty_metrics(self) -> dict:
        now = datetime.utcnow()
        return {
            "message_count": 0,
            "unique_chatters": 0,
            "message_entropy": 0.0,
            "unique_message_ratio": 0.0,
            "avg_time_between_msgs": 0.0,
            "window_start": now,
            "window_end": now,
        }

    def _compute_metrics(self, messages: list[dict], start_time: float) -> dict:
        if not messages:
            return self._empty_metrics()

        unique_users = set(m["user"] for m in messages)
        texts = [m["text"] for m in messages]
        total = len(texts)

        counter = Counter(texts)
        entropy = 0.0
        for count in counter.values():
            p = count / total
            if p > 0:
                entropy -= p * math.log2(p)

        unique_ratio = len(counter) / total if total > 0 else 0.0

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
