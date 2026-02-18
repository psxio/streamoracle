import logging
from datetime import datetime

from sqlalchemy.orm import Session

from app.analysis.signals.base import AbstractSignal
from app.analysis.signals.cvr import CVRSignal
from app.analysis.signals.step_function import StepFunctionSignal
from app.analysis.signals.chat_entropy import ChatEntropySignal
from app.analysis.signals.follower_ratio import FollowerRatioSignal
from app.analysis.signals.growth import GrowthSignal
from app.analysis.signals.benford import BenfordSignal
from app.analysis.signals.temporal import TemporalSignal
from app.analysis.weights import SIGNAL_WEIGHTS
from app.models.analysis_result import AnalysisResult

logger = logging.getLogger(__name__)


class AnalysisEngine:
    """Runs all signals and computes a weighted suspicion score."""

    def __init__(self):
        self.signals: list[AbstractSignal] = [
            CVRSignal(),
            StepFunctionSignal(),
            ChatEntropySignal(),
            FollowerRatioSignal(),
            GrowthSignal(),
            BenfordSignal(),
            TemporalSignal(),
        ]

    async def analyze(self, channel, snapshots: list, chat_metrics: list, db: Session) -> dict:
        signal_scores = []
        signal_details = {}
        weighted_sum = 0.0
        weight_confidence_sum = 0.0

        for signal in self.signals:
            try:
                result = await signal.calculate(snapshots, chat_metrics, channel)
                weight = SIGNAL_WEIGHTS.get(signal.name, signal.weight)

                signal_scores.append({
                    "name": signal.name,
                    "score": result.score,
                    "weight": weight,
                    "confidence": result.confidence,
                })
                signal_details[signal.name] = result.details

                weighted_sum += result.score * weight * result.confidence
                weight_confidence_sum += weight * result.confidence
            except Exception as e:
                logger.error("Signal %s failed: %s", signal.name, e)
                signal_scores.append({
                    "name": signal.name,
                    "score": 0,
                    "weight": SIGNAL_WEIGHTS.get(signal.name, signal.weight),
                    "confidence": 0,
                })

        # Weighted aggregation
        if weight_confidence_sum > 0:
            overall_score = weighted_sum / weight_confidence_sum
        else:
            overall_score = 0.0

        # Overall confidence: weighted average of signal confidences
        total_weight = sum(SIGNAL_WEIGHTS.get(s.name, s.weight) for s in self.signals)
        overall_confidence = (
            sum(
                s["confidence"] * SIGNAL_WEIGHTS.get(s["name"], 0)
                for s in signal_scores
            )
            / total_weight
            if total_weight > 0
            else 0.0
        )

        data_points = len(snapshots) + len(chat_metrics)

        # Store result in DB
        analysis = AnalysisResult(
            channel_id=channel.id,
            overall_score=round(overall_score, 2),
            confidence=round(overall_confidence, 2),
            signal_scores=signal_scores,
            signal_details=signal_details,
            data_points=data_points,
            analyzed_at=datetime.utcnow(),
        )
        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        return {
            "overall_score": round(overall_score, 2),
            "confidence": round(overall_confidence, 2),
            "signal_scores": signal_scores,
            "signal_details": signal_details,
            "data_points": data_points,
            "analyzed_at": analysis.analyzed_at,
        }
