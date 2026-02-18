from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey

from app.database import Base


class TweetLog(Base):
    __tablename__ = "tweet_logs"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=True)
    tweet_type = Column(String, nullable=False)  # high_score, score_change, milestone, anomaly
    tweet_text = Column(String, nullable=False)
    twitter_tweet_id = Column(String, nullable=True)
    tweeted_at = Column(DateTime, default=datetime.utcnow)
