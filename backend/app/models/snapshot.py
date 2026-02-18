from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Index

from app.database import Base


class ViewerSnapshot(Base):
    __tablename__ = "viewer_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    viewer_count = Column(Integer, nullable=False)
    chatter_count = Column(Integer, default=0)
    category = Column(String, nullable=True)
    collected_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_snapshot_channel_collected", "channel_id", "collected_at"),
    )
