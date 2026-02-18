from app.analysis.signals.base import AbstractSignal, SignalResult


class GrowthSignal(AbstractSignal):
    """Analyze growth patterns: viewer growth vs chatter growth correlation.

    Organic channels show correlated growth (r > 0.7).
    """

    @property
    def name(self) -> str:
        return "growth"

    @property
    def weight(self) -> float:
        return 0.10

    async def calculate(self, snapshots: list, chat_metrics: list, channel) -> SignalResult:
        # Need at least a few data points with both viewer and chatter data
        paired = [
            (s.viewer_count, s.chatter_count)
            for s in snapshots
            if s.viewer_count > 0 and s.chatter_count > 0
        ]

        if len(paired) < 5:
            return SignalResult(score=0, confidence=0.1, details={"reason": "insufficient paired data"})

        viewers = [p[0] for p in paired]
        chatters = [p[1] for p in paired]

        # Pearson correlation
        n = len(paired)
        mean_v = sum(viewers) / n
        mean_c = sum(chatters) / n

        cov = sum((v - mean_v) * (c - mean_c) for v, c in zip(viewers, chatters)) / n
        std_v = (sum((v - mean_v) ** 2 for v in viewers) / n) ** 0.5
        std_c = (sum((c - mean_c) ** 2 for c in chatters) / n) ** 0.5

        if std_v == 0 or std_c == 0:
            correlation = 0.0
        else:
            correlation = cov / (std_v * std_c)

        # Low correlation = suspicious (organic r > 0.7)
        if correlation >= 0.7:
            score = 0
        elif correlation >= 0.4:
            score = (0.7 - correlation) / 0.3 * 50
        elif correlation >= 0.0:
            score = 50 + (0.4 - correlation) / 0.4 * 30
        else:
            # Negative correlation is very suspicious
            score = 80 + min(20, abs(correlation) * 20)

        # Check growth rate anomalies
        if len(viewers) >= 3:
            viewer_changes = [
                (viewers[i] - viewers[i - 1]) / viewers[i - 1]
                for i in range(1, len(viewers))
                if viewers[i - 1] > 0
            ]
            if viewer_changes:
                avg_growth = sum(abs(c) for c in viewer_changes) / len(viewer_changes)
                if avg_growth > 0.5:  # >50% average change is unusual
                    score = min(100, score + 15)

        confidence = min(1.0, len(paired) / 15)

        return SignalResult(
            score=round(max(0, min(100, score)), 2),
            confidence=round(confidence, 2),
            details={
                "correlation": round(correlation, 4),
                "data_points": len(paired),
                "avg_viewers": round(mean_v, 0),
                "avg_chatters": round(mean_c, 0),
            },
        )
