import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.channel import Channel
from app.models.snapshot import ViewerSnapshot
from app.models.analysis_result import AnalysisResult
from app.schemas.channel import ChannelDetail, ChannelResponse, SnapshotResponse
from app.schemas.analysis import get_score_label

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/channels", tags=["channels"])


def _get_collector(platform: str):
    if platform == "twitch":
        from app.collectors.twitch import TwitchCollector
        return TwitchCollector()
    elif platform == "youtube":
        from app.collectors.youtube import YouTubeCollector
        return YouTubeCollector()
    elif platform == "kick":
        from app.collectors.kick import KickCollector
        return KickCollector()
    else:
        return None


async def _collect_channel(platform: str, username: str, db: Session):
    collector = _get_collector(platform)
    if not collector:
        return
    try:
        info = await collector.collect_channel_info(username)
        if not info:
            return
        channel = (
            db.query(Channel)
            .filter(Channel.platform == platform, Channel.username == username)
            .first()
        )
        if channel:
            for key, value in info.items():
                if hasattr(channel, key) and value is not None:
                    setattr(channel, key, value)
            channel.last_collected = datetime.utcnow()
        else:
            channel = Channel(**info, last_collected=datetime.utcnow())
            db.add(channel)
        db.commit()

        # Collect viewer snapshot
        viewers = await collector.collect_viewers(username)
        if viewers and channel.id:
            channel.is_live = viewers.get("is_live", False)
            snapshot = ViewerSnapshot(
                channel_id=channel.id,
                viewer_count=viewers.get("viewer_count", 0),
                chatter_count=viewers.get("chatter_count", 0),
                category=viewers.get("category"),
            )
            db.add(snapshot)
            db.commit()
    except Exception as e:
        logger.error("Collection failed for %s/%s: %s", platform, username, e)


@router.get("/{platform}/{username}", response_model=ChannelDetail)
async def get_channel(platform: str, username: str, db: Session = Depends(get_db)):
    channel = (
        db.query(Channel)
        .filter(Channel.platform == platform.lower(), Channel.username == username.lower())
        .first()
    )
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    latest = (
        db.query(AnalysisResult)
        .filter(AnalysisResult.channel_id == channel.id)
        .order_by(AnalysisResult.analyzed_at.desc())
        .first()
    )

    result = ChannelDetail.model_validate(channel)
    if latest:
        result.latest_analysis = {
            "overall_score": latest.overall_score,
            "confidence": latest.confidence,
            "label": get_score_label(latest.overall_score),
            "analyzed_at": latest.analyzed_at,
        }
    return result


@router.get("/{platform}/{username}/snapshots", response_model=list[SnapshotResponse])
async def get_snapshots(
    platform: str,
    username: str,
    hours: int = 24,
    db: Session = Depends(get_db),
):
    channel = (
        db.query(Channel)
        .filter(Channel.platform == platform.lower(), Channel.username == username.lower())
        .first()
    )
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    since = datetime.utcnow() - timedelta(hours=hours)
    snapshots = (
        db.query(ViewerSnapshot)
        .filter(
            ViewerSnapshot.channel_id == channel.id,
            ViewerSnapshot.collected_at >= since,
        )
        .order_by(ViewerSnapshot.collected_at.asc())
        .all()
    )
    return [SnapshotResponse.model_validate(s) for s in snapshots]


@router.post("/{platform}/{username}/track", response_model=ChannelResponse)
async def track_channel(
    platform: str,
    username: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    platform = platform.lower()
    username = username.lower()

    channel = (
        db.query(Channel)
        .filter(Channel.platform == platform, Channel.username == username)
        .first()
    )
    if not channel:
        # Create placeholder, collection will fill in details
        channel = Channel(
            platform=platform,
            platform_id="",
            username=username,
            display_name=username,
        )
        db.add(channel)
        db.commit()
        db.refresh(channel)

    # Trigger immediate collection in background
    background_tasks.add_task(_collect_channel, platform, username, SessionLocal())
    return ChannelResponse.model_validate(channel)


# Import SessionLocal here to avoid circular imports at module level
from app.database import SessionLocal
