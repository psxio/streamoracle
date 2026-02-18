from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ChannelBase(BaseModel):
    platform: str
    username: str
    display_name: str


class ChannelResponse(BaseModel):
    id: int
    platform: str
    username: str
    display_name: str
    avatar_url: Optional[str] = None
    category: Optional[str] = None
    follower_count: int = 0
    is_live: bool = False

    model_config = {"from_attributes": True}


class ChannelDetail(ChannelResponse):
    latest_analysis: Optional["AnalysisSummary"] = None


class AnalysisSummary(BaseModel):
    overall_score: float
    confidence: float
    label: str
    analyzed_at: datetime

    model_config = {"from_attributes": True}


class SnapshotResponse(BaseModel):
    id: int
    viewer_count: int
    chatter_count: int
    category: Optional[str] = None
    collected_at: datetime

    model_config = {"from_attributes": True}


class TrackRequest(BaseModel):
    platform: str
    username: str


class SearchResponse(BaseModel):
    results: list[ChannelResponse]
    total: int


ChannelDetail.model_rebuild()
