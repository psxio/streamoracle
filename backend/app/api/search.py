from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.channel import Channel
from app.schemas.channel import ChannelResponse, SearchResponse

router = APIRouter(prefix="/api/v1", tags=["search"])


@router.get("/search", response_model=SearchResponse)
async def search_channels(
    q: str = Query(..., min_length=1),
    platform: str | None = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(Channel).filter(Channel.username.ilike(f"%{q}%"))
    if platform:
        query = query.filter(Channel.platform == platform.lower())

    channels = query.limit(50).all()
    return SearchResponse(
        results=[ChannelResponse.model_validate(c) for c in channels],
        total=len(channels),
    )
