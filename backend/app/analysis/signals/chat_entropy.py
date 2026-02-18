from app.analysis.signals.base import AbstractSignal, SignalResult


class ChatEntropySignal(AbstractSignal):
    """Analyze chat diversity using Shannon entropy, unique message ratio,
    and timing regularity. Low entropy and low diversity suggest automated chat."""

    @property
    def name(self) -> str:
        return "chat_entropy"

    @property
    def weight(self) -> float:
        return 0.15

    async def calculate(self, snapshots: list, chat_metrics: list, channel) -> SignalResult:
        if not chat_metrics:
            return SignalResult(score=0, confidence=0, details={"reason": "no chat data"})

        entropies = [m.message_entropy for m in chat_metrics if m.message_count > 0]
        unique_ratios = [m.unique_message_ratio for m in chat_metrics if m.message_count > 0]
        timing_gaps = [m.avg_time_between_msgs for m in chat_metrics if m.message_count > 0]

        if not entropies:
            return SignalResult(score=0, confidence=0.1, details={"reason": "no message data"})

        avg_entropy = sum(entropies) / len(entropies)
        avg_unique_ratio = sum(unique_ratios) / len(unique_ratios) if unique_ratios else 0
        avg_timing = sum(timing_gaps) / len(timing_gaps) if timing_gaps else 0

        # Normalize entropy (typical chat ~4-8 bits)
        max_expected_entropy = 8.0
        normalized_entropy = min(1.0, avg_entropy / max_expected_entropy)

        # Low entropy score (inverted - low entropy = high score)
        entropy_score = (1 - normalized_entropy) * 100

        # Low unique ratio score
        unique_score = (1 - avg_unique_ratio) * 100 if avg_unique_ratio < 0.8 else 0

        # Very regular timing is suspicious (CV of timing gaps)
        timing_score = 0
        if avg_timing > 0 and len(timing_gaps) > 1:
            timing_std = (sum((t - avg_timing) ** 2 for t in timing_gaps) / len(timing_gaps)) ** 0.5
            timing_cv = timing_std / avg_timing if avg_timing > 0 else 1
            if timing_cv < 0.3:
                timing_score = (0.3 - timing_cv) / 0.3 * 100

        # Weighted combination
        score = entropy_score * 0.4 + unique_score * 0.35 + timing_score * 0.25
        confidence = min(1.0, len(entropies) / 5)

        return SignalResult(
            score=round(max(0, min(100, score)), 2),
            confidence=round(confidence, 2),
            details={
                "avg_entropy": round(avg_entropy, 4),
                "normalized_entropy": round(normalized_entropy, 4),
                "avg_unique_ratio": round(avg_unique_ratio, 4),
                "avg_timing_gap": round(avg_timing, 4),
                "entropy_score": round(entropy_score, 2),
                "unique_score": round(unique_score, 2),
                "timing_score": round(timing_score, 2),
                "data_points": len(entropies),
            },
        )
