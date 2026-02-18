from datetime import datetime

from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, JSON, Index

from app.database import Base


class AnalysisResult(Base):
    __tablename__ = "analysis_results"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(Integer, ForeignKey("channels.id"), nullable=False)
    overall_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    signal_scores = Column(JSON, nullable=True)
    signal_details = Column(JSON, nullable=True)
    data_points = Column(Integer, default=0)
    analyzed_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_analysis_overall_score", overall_score.desc()),
    )
