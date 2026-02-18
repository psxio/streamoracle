import statistics
from collections import defaultdict

from app.analysis.signals.base import AbstractSignal, SignalResult


class TemporalSignal(AbstractSignal):
    """Analyze coefficient of variation of hourly viewer averages.

    Natural streams have CV > 0.3 (viewer counts vary with time of day).
    CV < 0.2 suggests unnaturally flat/constant viewer numbers.
    """

    @property
    def name(self) -> str:
        return "temporal"

    @property
    def weight(self) -> float:
        return 0.10

    async def calculate(self, snapshots: list, chat_metrics: list, channel) -> SignalResult:
        if len(snapshots) < 10:
            return SignalResult(score=0, confidence=0.1, details={"reason": "insufficient data"})

        # Group viewer counts by hour of day
        hourly: dict[int, list[int]] = defaultdict(list)
        for snap in snapshots:
            if snap.viewer_count > 0 and snap.collected_at:
                hour = snap.collected_at.hour
                hourly[hour].append(snap.viewer_count)

        if len(hourly) < 3:
            return SignalResult(score=0, confidence=0.1, details={"reason": "need data across multiple hours"})

        # Compute hourly averages
        hourly_means = [statistics.mean(counts) for counts in hourly.values() if counts]
        if not hourly_means or len(hourly_means) < 2:
            return SignalResult(score=0, confidence=0.1, details={"reason": "insufficient hourly data"})

        mean = statistics.mean(hourly_means)
        std = statistics.stdev(hourly_means)
        cv = std / mean if mean > 0 else 0

        # Score: CV < 0.2 = suspicious (flat), CV > 0.3 = normal
        if cv >= 0.3:
            score = 0
        elif cv >= 0.2:
            score = (0.3 - cv) / 0.1 * 50
        elif cv >= 0.1:
            score = 50 + (0.2 - cv) / 0.1 * 30
        else:
            score = 80 + min(20, (0.1 - cv) / 0.1 * 20)

        confidence = min(1.0, len(snapshots) / 30)

        return SignalResult(
            score=round(max(0, min(100, score)), 2),
            confidence=round(confidence, 2),
            details={
                "coefficient_of_variation": round(cv, 4),
                "hourly_mean": round(mean, 0),
                "hourly_std": round(std, 2),
                "hours_covered": len(hourly),
                "total_snapshots": len(snapshots),
            },
        )
