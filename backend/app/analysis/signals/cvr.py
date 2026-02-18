from app.analysis.signals.base import AbstractSignal, SignalResult


class CVRSignal(AbstractSignal):
    """Chatter-to-Viewer Ratio signal.

    Organic channels typically have 5-20% of viewers actively chatting.
    A very low ratio suggests inflated viewer counts.
    """

    CATEGORY_BASELINE = 0.12  # 12% default baseline

    @property
    def name(self) -> str:
        return "cvr"

    @property
    def weight(self) -> float:
        return 0.25

    async def calculate(self, snapshots: list, chat_metrics: list, channel) -> SignalResult:
        if not snapshots:
            return SignalResult(score=0, confidence=0, details={"reason": "no data"})

        # Compute average CVR across snapshots
        ratios = []
        for snap in snapshots:
            if snap.viewer_count > 0 and snap.chatter_count > 0:
                ratio = snap.chatter_count / snap.viewer_count
                ratios.append(ratio)

        if not ratios:
            return SignalResult(score=0, confidence=0.1, details={"reason": "no chatter data"})

        avg_ratio = sum(ratios) / len(ratios)
        baseline = self.CATEGORY_BASELINE

        # Z-score relative to baseline (std ~0.05)
        std = 0.05
        z_score = (baseline - avg_ratio) / std if std > 0 else 0

        # Score: ratio > 5% = normal (score 0), drops below -> higher score
        if avg_ratio >= 0.05:
            score = 0.0
        elif avg_ratio >= 0.02:
            score = (0.05 - avg_ratio) / 0.03 * 50  # 0-50
        elif avg_ratio >= 0.005:
            score = 50 + (0.02 - avg_ratio) / 0.015 * 30  # 50-80
        else:
            score = 80 + min(20, (0.005 - avg_ratio) / 0.005 * 20)  # 80-100

        score = max(0, min(100, score))
        confidence = min(1.0, len(ratios) / 10)

        return SignalResult(
            score=round(score, 2),
            confidence=round(confidence, 2),
            details={
                "avg_cvr": round(avg_ratio, 4),
                "baseline": baseline,
                "z_score": round(z_score, 2),
                "data_points": len(ratios),
            },
        )
