from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey

from app.database import Base


class ChatMetric(Base):
    __tablename__ = "chat_metrics"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    window_start = Column(DateTime, nullable=False)
    window_end = Column(DateTime, nullable=False)
    message_count = Column(Integer, nullable=False)
    unique_chatters = Column(Integer, nullable=False)
    message_entropy = Column(Float, default=0.0)
    unique_message_ratio = Column(Float, default=0.0)
    avg_time_between_msgs = Column(Float, default=0.0)
