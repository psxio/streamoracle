from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.channel import Channel
from app.models.analysis_result import AnalysisResult
from app.schemas.analysis import LeaderboardEntry, get_score_label

router = APIRouter(prefix="/api/v1", tags=["leaderboard"])


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def get_leaderboard(
    platform: str | None = Query(None),
    category: str | None = Query(None),
    limit: int = Query(50, le=200),
    db: Session = Depends(get_db),
):
    # Subquery for latest analysis per channel
    latest_subq = (
        db.query(
            AnalysisResult.channel_id,
            func.max(AnalysisResult.analyzed_at).label("max_at"),
        )
        .group_by(AnalysisResult.channel_id)
        .subquery()
    )

    query = (
        db.query(AnalysisResult, Channel)
        .join(Channel, Channel.id == AnalysisResult.channel_id)
        .join(
            latest_subq,
            (AnalysisResult.channel_id == latest_subq.c.channel_id)
            & (AnalysisResult.analyzed_at == latest_subq.c.max_at),
        )
    )

    if platform:
        query = query.filter(Channel.platform == platform.lower())
    if category:
        query = query.filter(Channel.category.ilike(f"%{category}%"))

    query = query.order_by(AnalysisResult.overall_score.desc()).limit(limit)
    results = query.all()

    entries = []
    for rank, (analysis, channel) in enumerate(results, 1):
        entries.append(
            LeaderboardEntry(
                rank=rank,
                channel_id=channel.id,
                platform=channel.platform,
                username=channel.username,
                display_name=channel.display_name,
                avatar_url=channel.avatar_url,
                overall_score=analysis.overall_score,
                label=get_score_label(analysis.overall_score),
                analyzed_at=analysis.analyzed_at,
            )
        )

    return entries
