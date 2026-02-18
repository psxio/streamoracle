import asyncio
import logging
import math
import time
from collections import Counter
from datetime import datetime

import httpx

from app.collectors.base import AbstractCollector
from app.config import settings
from app.utils.rate_limiter import RateLimiter

logger = logging.getLogger(__name__)


class YouTubeCollector(AbstractCollector):
    """Collects data from YouTube using the Data API v3."""

    API_BASE = "https://www.googleapis.com/youtube/v3"
    DAILY_QUOTA_LIMIT = 10000

    def __init__(self):
        self._quota_used = 0
        self._quota_reset_time = time.time() + 86400
        self._rate_limiter = RateLimiter(rate=10, capacity=10)
        self._client: httpx.AsyncClient | None = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(timeout=15.0)
        return self._client

    def _check_quota(self, cost: int = 1):
        if time.time() > self._quota_reset_time:
            self._quota_used = 0
            self._quota_reset_time = time.time() + 86400
        if self._quota_used + cost > self.DAILY_QUOTA_LIMIT:
            raise RuntimeError("YouTube API daily quota limit reached")
        self._quota_used += cost

    async def _api_get(self, endpoint: str, params: dict) -> dict:
        if not settings.YOUTUBE_API_KEY:
            logger.warning("YouTube API key not configured")
            return {}
        await self._rate_limiter.acquire()
        params["key"] = settings.YOUTUBE_API_KEY
        client = await self._get_client()
        resp = await client.get(f"{self.API_BASE}/{endpoint}", params=params)
        resp.raise_for_status()
        return resp.json()

    async def collect_channel_info(self, username: str) -> dict:
        self._check_quota(100)  # search.list costs 100 units
        search_data = await self._api_get(
            "search",
            {"part": "snippet", "q": username, "type": "channel", "maxResults": 1},
        )
        items = search_data.get("items", [])
        if not items:
            return {}
        channel_id = items[0]["snippet"]["channelId"]

        self._check_quota(1)
        channel_data = await self._api_get(
            "channels",
            {"part": "snippet,statistics", "id": channel_id},
        )
        channels = channel_data.get("items", [])
        if not channels:
            return {}
        ch = channels[0]
        snippet = ch.get("snippet", {})
        stats = ch.get("statistics", {})

        return {
            "platform": "youtube",
            "platform_id": channel_id,
            "username": username,
            "display_name": snippet.get("title", username),
            "avatar_url": snippet.get("thumbnails", {}).get("default", {}).get("url"),
            "category": None,
            "follower_count": int(stats.get("subscriberCount", 0)),
        }

    async def collect_viewers(self, username: str) -> dict:
        self._check_quota(100)
        search_data = await self._api_get(
            "search",
            {
                "part": "id",
                "channelId": username,
                "eventType": "live",
                "type": "video",
                "maxResults": 1,
            },
        )
        items = search_data.get("items", [])
        if not items:
            return {"viewer_count": 0, "chatter_count": 0, "is_live": False}

        video_id = items[0]["id"].get("videoId", "")
        self._check_quota(1)
        video_data = await self._api_get(
            "videos",
            {"part": "liveStreamingDetails,snippet", "id": video_id},
        )
        videos = video_data.get("items", [])
        if not videos:
            return {"viewer_count": 0, "chatter_count": 0, "is_live": False}

        live_details = videos[0].get("liveStreamingDetails", {})
        viewer_count = int(live_details.get("concurrentViewers", 0))

        return {
            "viewer_count": viewer_count,
            "chatter_count": 0,
            "is_live": True,
            "category": videos[0].get("snippet", {}).get("categoryId"),
        }

    async def collect_chat_metrics(
        self, username: str, duration_seconds: int = 60
    ) -> dict:
        # Find active live chat
        self._check_quota(100)
        search_data = await self._api_get(
            "search",
            {
                "part": "id",
                "channelId": username,
                "eventType": "live",
                "type": "video",
                "maxResults": 1,
            },
        )
        items = search_data.get("items", [])
        if not items:
            return self._empty_metrics()

        video_id = items[0]["id"].get("videoId", "")
        self._check_quota(1)
        video_data = await self._api_get(
            "videos", {"part": "liveStreamingDetails", "id": video_id}
        )
        videos = video_data.get("items", [])
        if not videos:
            return self._empty_metrics()

        live_chat_id = videos[0].get("liveStreamingDetails", {}).get(
            "activeLiveChatId"
        )
        if not live_chat_id:
            return self._empty_metrics()

        messages: list[dict] = []
        start_time = time.time()
        page_token = None

        while time.time() - start_time < duration_seconds:
            self._check_quota(5)
            params = {
                "part": "snippet,authorDetails",
                "liveChatId": live_chat_id,
                "maxResults": 200,
            }
            if page_token:
                params["pageToken"] = page_token

            try:
                chat_data = await self._api_get("liveChat/messages", params)
            except Exception as e:
                logger.warning("YouTube chat collection error: %s", e)
                break

            for item in chat_data.get("items", []):
                messages.append(
                    {
                        "user": item.get("authorDetails", {}).get(
                            "displayName", "unknown"
                        ),
                        "text": item.get("snippet", {}).get("displayMessage", ""),
                        "time": time.time(),
                    }
                )
            page_token = chat_data.get("nextPageToken")
            poll_ms = chat_data.get("pollingIntervalMillis", 5000)
            await asyncio.sleep(poll_ms / 1000)

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
