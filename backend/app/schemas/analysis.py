from datetime import datetime
from typing import Optional

from pydantic import BaseModel


def get_score_label(score: float) -> str:
    if score <= 20:
        return "Normal"
    elif score <= 40:
        return "Low"
    elif score <= 60:
        return "Moderate"
    elif score <= 80:
        return "Elevated"
    else:
        return "High"


class SignalScore(BaseModel):
    name: str
    score: float
    weight: float
    confidence: float
    details: dict = {}


class AnalysisResponse(BaseModel):
    overall_score: float
    confidence: float
    label: str
    signal_scores: list[SignalScore]
    data_points: int
    analyzed_at: datetime

    model_config = {"from_attributes": True}


class LeaderboardEntry(BaseModel):
    rank: int
    channel_id: int
    platform: str
    username: str
    display_name: str
    avatar_url: Optional[str] = None
    overall_score: float
    label: str
    analyzed_at: datetime

    model_config = {"from_attributes": True}


class MethodologySignal(BaseModel):
    name: str
    weight: float
    description: str


class MethodologyResponse(BaseModel):
    signals: list[MethodologySignal]
    score_labels: dict[str, str]
    description: str
