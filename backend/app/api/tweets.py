import asyncio
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.tweet_log import TweetLog
from app.twitter.poster import post_interesting_tweet

router = APIRouter(prefix="/api/v1", tags=["tweets"])


@router.get("/tweets")
async def get_tweet_history(limit: int = 20, db: Session = Depends(get_db)):
    """Get recent tweet history."""
    tweets = (
        db.query(TweetLog)
        .order_by(TweetLog.tweeted_at.desc())
        .limit(min(limit, 100))
        .all()
    )
    return [
        {
            "id": t.id,
            "channel_id": t.channel_id,
            "tweet_type": t.tweet_type,
            "tweet_text": t.tweet_text,
            "twitter_tweet_id": t.twitter_tweet_id,
            "tweeted_at": t.tweeted_at.isoformat() if t.tweeted_at else None,
        }
        for t in tweets
    ]


@router.post("/tweets/trigger")
async def trigger_tweet():
    """Manually trigger the bot to find and post an interesting tweet."""
    await post_interesting_tweet()
    return {"status": "ok", "message": "Tweet cycle executed. Check /api/v1/tweets for result."}
