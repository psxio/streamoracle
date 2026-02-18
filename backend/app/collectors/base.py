from abc import ABC, abstractmethod


class AbstractCollector(ABC):
    """Base class for platform-specific data collectors."""

    @abstractmethod
    async def collect_channel_info(self, username: str) -> dict:
        """Collect channel metadata (display name, avatar, followers, etc.)."""
        ...

    @abstractmethod
    async def collect_viewers(self, username: str) -> dict:
        """Collect current viewer and chatter counts."""
        ...

    @abstractmethod
    async def collect_chat_metrics(self, username: str, duration_seconds: int = 60) -> dict:
        """Collect chat messages and compute metrics over a time window."""
        ...
