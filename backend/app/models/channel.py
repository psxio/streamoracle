from datetime import datetime

from sqlalchemy import Column, Integer, String, Boolean, DateTime, UniqueConstraint, Index

from app.database import Base


class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String, nullable=False, index=True)
    platform_id = Column(String, nullable=False)
    username = Column(String, nullable=False, index=True)
    display_name = Column(String, nullable=False)
    avatar_url = Column(String, nullable=True)
    category = Column(String, nullable=True)
    follower_count = Column(Integer, default=0)
    is_live = Column(Boolean, default=False)
    last_collected = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("platform", "username", name="uq_platform_username"),
    )
