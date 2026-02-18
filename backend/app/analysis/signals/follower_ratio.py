from app.analysis.signals.base import AbstractSignal, SignalResult


class FollowerRatioSignal(AbstractSignal):
    """Compare concurrent viewers to follower count.

    If viewers consistently exceed followers, that is a major red flag.
    """

    @property
    def name(self) -> str:
        return "follower_ratio"

    @property
    def weight(self) -> float:
        return 0.10

    async def calculate(self, snapshots: list, chat_metrics: list, channel) -> SignalResult:
        follower_count = getattr(channel, "follower_count", 0)
        if not follower_count or follower_count == 0:
            return SignalResult(score=0, confidence=0.1, details={"reason": "no follower data"})

        viewer_counts = [s.viewer_count for s in snapshots if s.viewer_count > 0]
        if not viewer_counts:
            return SignalResult(score=0, confidence=0.1, details={"reason": "no viewer data"})

        avg_viewers = sum(viewer_counts) / len(viewer_counts)
        max_viewers = max(viewer_counts)
        ratio = avg_viewers / follower_count

        # Scoring: viewers > followers is highly suspicious
        if ratio > 1.0:
            score = min(100, 60 + (ratio - 1.0) * 40)
        elif ratio > 0.5:
            score = (ratio - 0.5) / 0.5 * 40 + 20
        elif ratio > 0.2:
            score = (ratio - 0.2) / 0.3 * 20
        else:
            score = 0

        confidence = min(1.0, len(viewer_counts) / 10)

        return SignalResult(
            score=round(max(0, min(100, score)), 2),
            confidence=round(confidence, 2),
            details={
                "avg_viewers": round(avg_viewers, 0),
                "max_viewers": max_viewers,
                "follower_count": follower_count,
                "viewer_follower_ratio": round(ratio, 4),
                "data_points": len(viewer_counts),
            },
        )
