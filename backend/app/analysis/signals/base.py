from abc import ABC, abstractmethod
from dataclasses import dataclass, field


@dataclass
class SignalResult:
    score: float  # 0-100
    confidence: float  # 0-1
    details: dict = field(default_factory=dict)


class AbstractSignal(ABC):

    @property
    @abstractmethod
    def name(self) -> str:
        ...

    @property
    @abstractmethod
    def weight(self) -> float:
        ...

    @abstractmethod
    async def calculate(self, snapshots: list, chat_metrics: list, channel) -> SignalResult:
        ...
