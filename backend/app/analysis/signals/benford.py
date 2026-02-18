import math

from app.analysis.signals.base import AbstractSignal, SignalResult


# Expected Benford's Law first-digit distribution
BENFORD_EXPECTED = {
    1: 0.301, 2: 0.176, 3: 0.125, 4: 0.097,
    5: 0.079, 6: 0.067, 7: 0.058, 8: 0.051, 9: 0.046,
}


class BenfordSignal(AbstractSignal):
    """Apply Benford's Law to first digits of viewer counts.

    Natural data follows a logarithmic distribution of leading digits.
    Chi-squared test and MAD > 0.015 indicate suspicious deviation.
    """

    @property
    def name(self) -> str:
        return "benford"

    @property
    def weight(self) -> float:
        return 0.10

    async def calculate(self, snapshots: list, chat_metrics: list, channel) -> SignalResult:
        counts = [s.viewer_count for s in snapshots if s.viewer_count > 0]
        if len(counts) < 20:
            return SignalResult(score=0, confidence=0.1, details={"reason": "need at least 20 data points"})

        # Extract first digits
        first_digits = []
        for c in counts:
            first_digit = int(str(c)[0])
            if 1 <= first_digit <= 9:
                first_digits.append(first_digit)

        if not first_digits:
            return SignalResult(score=0, confidence=0.1, details={"reason": "no valid digits"})

        n = len(first_digits)
        observed = {d: 0 for d in range(1, 10)}
        for d in first_digits:
            observed[d] += 1

        # Chi-squared test
        chi_squared = 0.0
        for d in range(1, 10):
            expected = BENFORD_EXPECTED[d] * n
            if expected > 0:
                chi_squared += (observed[d] - expected) ** 2 / expected

        # Mean Absolute Deviation
        mad = 0.0
        observed_freq = {}
        for d in range(1, 10):
            freq = observed[d] / n
            observed_freq[d] = round(freq, 4)
            mad += abs(freq - BENFORD_EXPECTED[d])
        mad /= 9

        # Scoring: MAD > 0.015 = suspicious
        if mad <= 0.006:
            score = 0
        elif mad <= 0.012:
            score = (mad - 0.006) / 0.006 * 30
        elif mad <= 0.015:
            score = 30 + (mad - 0.012) / 0.003 * 20
        else:
            score = 50 + min(50, (mad - 0.015) / 0.015 * 50)

        # Critical chi-squared value for df=8, p=0.05 is 15.507
        if chi_squared > 15.507:
            score = min(100, score + 10)

        confidence = min(1.0, n / 50)

        return SignalResult(
            score=round(max(0, min(100, score)), 2),
            confidence=round(confidence, 2),
            details={
                "chi_squared": round(chi_squared, 4),
                "mad": round(mad, 6),
                "sample_size": n,
                "observed_distribution": observed_freq,
                "chi_sq_critical_p05": 15.507,
            },
        )
