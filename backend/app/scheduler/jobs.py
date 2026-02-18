import asyncio
import logging
from datetime import datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.config import settings
from app.database import SessionLocal
from app.models.channel import Channel
from app.models.snapshot import ViewerSnapshot
from app.models.chat_metric import ChatMetric
from app.analysis.engine import AnalysisEngine
from app.twitter.poster import post_interesting_tweet

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()
engine = AnalysisEngine()


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
    return None


async def collect_all_channels():
    """Collect viewer data from all tracked channels."""
    logger.info("Starting scheduled collection run")
    db = SessionLocal()
    try:
        channels = db.query(Channel).all()
        for channel in channels:
            collector = _get_collector(channel.platform)
            if not collector:
                continue
            try:
                # Collect viewer snapshot
                viewers = await collector.collect_viewers(channel.username)
                if viewers:
                    channel.is_live = viewers.get("is_live", False)
                    snapshot = ViewerSnapshot(
                        channel_id=channel.id,
                        viewer_count=viewers.get("viewer_count", 0),
                        chatter_count=viewers.get("chatter_count", 0),
                        category=viewers.get("category"),
                    )
                    db.add(snapshot)

                # Collect chat metrics if live
                if channel.is_live:
                    metrics = await collector.collect_chat_metrics(
                        channel.username, duration_seconds=30
                    )
                    if metrics and metrics.get("message_count", 0) > 0:
                        chat_metric = ChatMetric(
                            channel_id=channel.id,
                            window_start=metrics["window_start"],
                            window_end=metrics["window_end"],
                            message_count=metrics["message_count"],
                            unique_chatters=metrics["unique_chatters"],
                            message_entropy=metrics["message_entropy"],
                            unique_message_ratio=metrics["unique_message_ratio"],
                            avg_time_between_msgs=metrics["avg_time_between_msgs"],
                        )
                        db.add(chat_metric)

                channel.last_collected = datetime.utcnow()
                db.commit()
                logger.info("Collected data for %s/%s", channel.platform, channel.username)
            except Exception as e:
                logger.error(
                    "Collection failed for %s/%s: %s",
                    channel.platform,
                    channel.username,
                    e,
                )
                db.rollback()
    finally:
        db.close()
    logger.info("Scheduled collection run complete")


async def analyze_all_channels():
    """Run analysis on channels with enough data."""
    logger.info("Starting scheduled analysis run")
    db = SessionLocal()
    try:
        channels = db.query(Channel).all()
        for channel in channels:
            snapshots = (
                db.query(ViewerSnapshot)
                .filter(ViewerSnapshot.channel_id == channel.id)
                .order_by(ViewerSnapshot.collected_at.desc())
                .limit(500)
                .all()
            )
            if len(snapshots) < 3:
                continue

            chat_metrics = (
                db.query(ChatMetric)
                .filter(ChatMetric.channel_id == channel.id)
                .order_by(ChatMetric.window_end.desc())
                .limit(100)
                .all()
            )

            try:
                await engine.analyze(channel, snapshots, chat_metrics, db)
                logger.info("Analyzed %s/%s", channel.platform, channel.username)
            except Exception as e:
                logger.error(
                    "Analysis failed for %s/%s: %s",
                    channel.platform,
                    channel.username,
                    e,
                )
                db.rollback()
    finally:
        db.close()
    logger.info("Scheduled analysis run complete")


async def collect_channel_on_demand(platform: str, username: str):
    """Trigger immediate collection for a newly tracked channel."""
    db = SessionLocal()
    try:
        collector = _get_collector(platform)
        if not collector:
            return
        channel = (
            db.query(Channel)
            .filter(Channel.platform == platform, Channel.username == username)
            .first()
        )
        if not channel:
            return

        info = await collector.collect_channel_info(username)
        if info:
            for key, value in info.items():
                if hasattr(channel, key) and value is not None:
                    setattr(channel, key, value)

        viewers = await collector.collect_viewers(username)
        if viewers:
            channel.is_live = viewers.get("is_live", False)
            snapshot = ViewerSnapshot(
                channel_id=channel.id,
                viewer_count=viewers.get("viewer_count", 0),
                chatter_count=viewers.get("chatter_count", 0),
                category=viewers.get("category"),
            )
            db.add(snapshot)

        channel.last_collected = datetime.utcnow()
        db.commit()
    except Exception as e:
        logger.error("On-demand collection failed for %s/%s: %s", platform, username, e)
        db.rollback()
    finally:
        db.close()


def start_scheduler():
    """Start the APScheduler with configured intervals."""
    scheduler.add_job(
        collect_all_channels,
        "interval",
        minutes=settings.COLLECT_INTERVAL_MINUTES,
        id="collect_all",
        replace_existing=True,
    )
    scheduler.add_job(
        analyze_all_channels,
        "interval",
        minutes=settings.ANALYZE_INTERVAL_MINUTES,
        id="analyze_all",
        replace_existing=True,
    )
    scheduler.add_job(
        post_interesting_tweet,
        "interval",
        hours=settings.TWEET_INTERVAL_HOURS,
        id="tweet_stats",
        replace_existing=True,
    )
    scheduler.start()
    logger.info(
        "Scheduler started: collect every %d min, analyze every %d min, tweet every %d hrs",
        settings.COLLECT_INTERVAL_MINUTES,
        settings.ANALYZE_INTERVAL_MINUTES,
        settings.TWEET_INTERVAL_HOURS,
    )


def stop_scheduler():
    """Gracefully shut down the scheduler."""
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("Scheduler stopped")
