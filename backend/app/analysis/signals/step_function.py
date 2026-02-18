import statistics

from app.analysis.signals.base import AbstractSignal, SignalResult


class StepFunctionSignal(AbstractSignal):
    """Detect sharp, unnatural jumps in viewer counts.

    Rolling window analysis flags jumps >15% AND >3 standard deviations
    from the rolling mean.
    """

    JUMP_THRESHOLD = 0.15  # 15% change
    SIGMA_THRESHOLD = 3.0
    WINDOW_SIZE = 6

    @property
    def name(self) -> str:
        return "step_function"

    @property
    def weight(self) -> float:
        return 0.20

    async def calculate(self, snapshots: list, chat_metrics: list, channel) -> SignalResult:
        counts = [s.viewer_count for s in snapshots if s.viewer_count > 0]
        if len(counts) < self.WINDOW_SIZE + 1:
            return SignalResult(score=0, confidence=0.1, details={"reason": "insufficient data"})

        steps_detected = []
        for i in range(self.WINDOW_SIZE, len(counts)):
            window = counts[i - self.WINDOW_SIZE : i]
            current = counts[i]
            mean = statistics.mean(window)
            std = statistics.stdev(window) if len(window) > 1 else 1

            if mean == 0:
                continue

            pct_change = abs(current - mean) / mean
            z = abs(current - mean) / std if std > 0 else 0

            if pct_change > self.JUMP_THRESHOLD and z > self.SIGMA_THRESHOLD:
                steps_detected.append({
                    "index": i,
                    "pct_change": round(pct_change, 4),
                    "z_score": round(z, 2),
                    "from_mean": round(mean, 0),
                    "to_value": current,
                })

        total_windows = len(counts) - self.WINDOW_SIZE
        step_frequency = len(steps_detected) / total_windows if total_windows > 0 else 0

        # Score based on frequency and magnitude
        if not steps_detected:
            score = 0.0
        else:
            avg_magnitude = sum(s["pct_change"] for s in steps_detected) / len(steps_detected)
            score = min(100, step_frequency * 200 + avg_magnitude * 100)

        confidence = min(1.0, len(counts) / 20)

        return SignalResult(
            score=round(max(0, min(100, score)), 2),
            confidence=round(confidence, 2),
            details={
                "steps_detected": len(steps_detected),
                "step_frequency": round(step_frequency, 4),
                "total_windows": total_windows,
                "examples": steps_detected[:5],
            },
        )
