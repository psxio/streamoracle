from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.channel import Channel
from app.models.analysis_result import AnalysisResult
from app.schemas.analysis import AnalysisResponse, SignalScore, get_score_label

router = APIRouter(prefix="/api/v1/analysis", tags=["analysis"])


@router.get("/{platform}/{username}/latest", response_model=AnalysisResponse)
async def get_latest_analysis(
    platform: str,
    username: str,
    db: Session = Depends(get_db),
):
    channel = (
        db.query(Channel)
        .filter(Channel.platform == platform.lower(), Channel.username == username.lower())
        .first()
    )
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    analysis = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.channel_id == channel.id)
        .order_by(AnalysisResult.analyzed_at.desc())
        .first()
    )
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis available for this channel")

    signal_scores = []
    for s in analysis.signal_scores or []:
        signal_scores.append(
            SignalScore(
                name=s["name"],
                score=s["score"],
                weight=s["weight"],
                confidence=s["confidence"],
                details=(analysis.signal_details or {}).get(s["name"], {}),
            )
        )

    return AnalysisResponse(
        overall_score=analysis.overall_score,
        confidence=analysis.confidence,
        label=get_score_label(analysis.overall_score),
        signal_scores=signal_scores,
        data_points=analysis.data_points,
        analyzed_at=analysis.analyzed_at,
    )
