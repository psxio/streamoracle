"""
StreamOracle Twitter/X Bot — Posts interesting viewership stats automatically.

Tweet types:
  high_score   — Channel with a high suspicion score (>50)
  score_change — Significant score change between analyses
  milestone    — Platform tracking milestones (every 25 channels)
  anomaly      — Live channel with a sudden viewer spike
"""

import logging
import random
from datetime import datetime, timedelta

import tweepy
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.database import SessionLocal
from app.models.channel import Channel
from app.models.analysis_result import AnalysisResult
from app.models.snapshot import ViewerSnapshot
from app.models.tweet_log import TweetLog

logger = logging.getLogger(__name__)

SCORE_LABELS = {
    (0, 20): "Normal",
    (20, 40): "Low",
    (40, 60): "Moderate",
    (60, 80): "Elevated",
    (80, 101): "High",
}

# --- Tweet templates ---

HIGH_SCORE_TEMPLATES = [
    "🔍 {display_name} on {platform} scored {score}/100 on our suspicion index.\n\nTop signal: {top_signal} ({top_score}/100)\n\nFull breakdown → {url}",
    "📡 {platform} channel {display_name} flagged with {label} suspicion ({score}/100).\n\n{top_signal} is the strongest signal at {top_score}/100.\n\nDetails: {url}",
    "⚠️ Suspicion alert: {display_name} ({platform}) hit {score}/100.\n\nDriven by {top_signal} ({top_score}/100).\n\nSee the analysis → {url}",
]

SCORE_CHANGE_TEMPLATES = [
    "📈 Score update: {display_name} ({platform}) went from {old_score} → {new_score}/100.\n\n{direction} of {delta} points.\n\nTrack it live → {url}",
    "🔄 {display_name}'s suspicion score just {verb} by {delta} points ({old_score} → {new_score}).\n\nSee what changed → {url}",
]

MILESTONE_TEMPLATES = [
    "📊 StreamOracle is now tracking {count} channels across Twitch, YouTube, and Kick.\n\nEvery stream scored. No accusations — just data.\n\n{site_url}",
    "🎯 Milestone: {count} channels tracked and analyzed.\n\nScoring viewership authenticity across Twitch, YouTube & Kick.\n\n{site_url}",
]

ANOMALY_TEMPLATES = [
    "⚡ Anomaly: {display_name} ({platform}) had a {percent}% viewer jump in the last collection window.\n\nCurrent score: {score}/100\n\n{url}",
    "🚨 Viewer spike detected: {display_name} on {platform} — {old_viewers:,} → {new_viewers:,} viewers ({percent}% jump).\n\nSuspicion score: {score}/100\n\n{url}",
]

DAILY_RECAP_TEMPLATES = [
    "📋 Daily recap from StreamOracle:\n\n• {count} channels tracked\n• Most suspicious: {top_channel} ({top_score}/100)\n• Avg suspicion: {avg_score}/100\n\nLeaderboard → {site_url}/leaderboard",
    "🌐 StreamOracle daily update:\n\nTracking {count} channels.\nHighest suspicion: {top_channel} at {top_score}/100.\nPlatform average: {avg_score}/100.\n\nExplore → {site_url}/leaderboard",
]


def _get_label(score: float) -> str:
    for (lo, hi), label in SCORE_LABELS.items():
        if lo <= score < hi:
            return label
    return "Unknown"


def _get_client() -> tweepy.Client | None:
    """Create a Tweepy v2 client if credentials are configured."""
    if not all([
        settings.TWITTER_API_KEY,
        settings.TWITTER_API_SECRET,
        settings.TWITTER_ACCESS_TOKEN,
        settings.TWITTER_ACCESS_TOKEN_SECRET,
    ]):
        logger.info("Twitter credentials not configured — skipping tweet")
        return None

    return tweepy.Client(
        consumer_key=settings.TWITTER_API_KEY,
        consumer_secret=settings.TWITTER_API_SECRET,
        access_token=settings.TWITTER_ACCESS_TOKEN,
        access_token_secret=settings.TWITTER_ACCESS_TOKEN_SECRET,
    )


def _channel_url(platform: str, username: str) -> str:
    return f"{settings.SITE_URL}/channel/{platform}/{username}"


def _was_recently_tweeted(db: Session, channel_id: int | None, tweet_type: str, hours: int = 24) -> bool:
    """Check if we already tweeted about this channel/type recently."""
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    q = db.query(TweetLog).filter(
        TweetLog.tweet_type == tweet_type,
        TweetLog.tweeted_at >= cutoff,
    )
    if channel_id is not None:
        q = q.filter(TweetLog.channel_id == channel_id)
    return q.first() is not None


def _post_tweet(db: Session, text: str, tweet_type: str, channel_id: int | None = None) -> bool:
    """Post a tweet and log it. Returns True on success."""
    client = _get_client()
    if not client:
        return False

    # Truncate to 280 chars (Twitter limit)
    if len(text) > 280:
        text = text[:277] + "..."

    try:
        response = client.create_tweet(text=text)
        tweet_id = str(response.data["id"]) if response.data else None

        log = TweetLog(
            channel_id=channel_id,
            tweet_type=tweet_type,
            tweet_text=text,
            twitter_tweet_id=tweet_id,
        )
        db.add(log)
        db.commit()
        logger.info("Tweet posted (type=%s): %s", tweet_type, text[:80])
        return True
    except tweepy.TweepyException as e:
        logger.error("Failed to post tweet: %s", e)
        return False


def _try_high_score_tweet(db: Session) -> bool:
    """Tweet about a channel with a high suspicion score."""
    # Find channels with score > 50 that haven't been tweeted about recently
    cutoff = datetime.utcnow() - timedelta(hours=48)
    recently_tweeted_ids = (
        db.query(TweetLog.channel_id)
        .filter(TweetLog.tweet_type == "high_score", TweetLog.tweeted_at >= cutoff)
        .all()
    )
    exclude_ids = {r[0] for r in recently_tweeted_ids if r[0]}

    # Get latest analysis for each channel, score > 50
    subq = (
        db.query(
            AnalysisResult.channel_id,
            func.max(AnalysisResult.analyzed_at).label("latest"),
        )
        .group_by(AnalysisResult.channel_id)
        .subquery()
    )

    results = (
        db.query(AnalysisResult, Channel)
        .join(subq, (AnalysisResult.channel_id == subq.c.channel_id) & (AnalysisResult.analyzed_at == subq.c.latest))
        .join(Channel, AnalysisResult.channel_id == Channel.id)
        .filter(AnalysisResult.overall_score > 50)
        .order_by(AnalysisResult.overall_score.desc())
        .all()
    )

    candidates = [(ar, ch) for ar, ch in results if ch.id not in exclude_ids]
    if not candidates:
        return False

    # Pick a random one from top 5 for variety
    ar, channel = random.choice(candidates[:5])

    # Find top signal
    top_signal_name = "Unknown"
    top_signal_score = 0
    if ar.signal_scores:
        for s in ar.signal_scores:
            if s.get("score", 0) > top_signal_score:
                top_signal_score = s["score"]
                top_signal_name = s["name"]

    text = random.choice(HIGH_SCORE_TEMPLATES).format(
        display_name=channel.display_name,
        platform=channel.platform.capitalize(),
        score=round(ar.overall_score),
        label=_get_label(ar.overall_score),
        top_signal=top_signal_name.replace("_", " ").title(),
        top_score=round(top_signal_score),
        url=_channel_url(channel.platform, channel.username),
    )
    return _post_tweet(db, text, "high_score", channel.id)


def _try_score_change_tweet(db: Session) -> bool:
    """Tweet about a significant score change (>15 points)."""
    # Find channels with 2+ analyses
    channels_with_analyses = (
        db.query(AnalysisResult.channel_id)
        .group_by(AnalysisResult.channel_id)
        .having(func.count(AnalysisResult.id) >= 2)
        .all()
    )

    candidates = []
    for (channel_id,) in channels_with_analyses:
        if _was_recently_tweeted(db, channel_id, "score_change", hours=48):
            continue

        recent = (
            db.query(AnalysisResult)
            .filter(AnalysisResult.channel_id == channel_id)
            .order_by(AnalysisResult.analyzed_at.desc())
            .limit(2)
            .all()
        )
        if len(recent) < 2:
            continue

        new_score = recent[0].overall_score
        old_score = recent[1].overall_score
        delta = abs(new_score - old_score)
        if delta >= 15:
            channel = db.query(Channel).get(channel_id)
            if channel:
                candidates.append((channel, old_score, new_score, delta))

    if not candidates:
        return False

    # Pick the biggest change
    candidates.sort(key=lambda x: x[3], reverse=True)
    channel, old_score, new_score, delta = candidates[0]

    direction = "Increase" if new_score > old_score else "Decrease"
    verb = "jumped" if new_score > old_score else "dropped"

    text = random.choice(SCORE_CHANGE_TEMPLATES).format(
        display_name=channel.display_name,
        platform=channel.platform.capitalize(),
        old_score=round(old_score),
        new_score=round(new_score),
        delta=round(delta),
        direction=direction,
        verb=verb,
        url=_channel_url(channel.platform, channel.username),
    )
    return _post_tweet(db, text, "score_change", channel.id)


def _try_milestone_tweet(db: Session) -> bool:
    """Tweet when we hit a channel tracking milestone (every 25)."""
    count = db.query(Channel).count()
    milestone = (count // 25) * 25
    if milestone < 25:
        return False

    if _was_recently_tweeted(db, None, "milestone", hours=168):  # 7 days
        return False

    text = random.choice(MILESTONE_TEMPLATES).format(
        count=count,
        site_url=settings.SITE_URL,
    )
    return _post_tweet(db, text, "milestone")


def _try_anomaly_tweet(db: Session) -> bool:
    """Tweet about a live channel with a sudden viewer spike."""
    live_channels = db.query(Channel).filter(Channel.is_live == True).all()
    candidates = []

    for channel in live_channels:
        if _was_recently_tweeted(db, channel.id, "anomaly", hours=24):
            continue

        snapshots = (
            db.query(ViewerSnapshot)
            .filter(ViewerSnapshot.channel_id == channel.id)
            .order_by(ViewerSnapshot.collected_at.desc())
            .limit(3)
            .all()
        )
        if len(snapshots) < 2:
            continue

        new_v = snapshots[0].viewer_count
        old_v = snapshots[1].viewer_count
        if old_v > 100 and new_v > old_v:
            percent = ((new_v - old_v) / old_v) * 100
            if percent >= 50:
                # Get latest score
                latest = (
                    db.query(AnalysisResult)
                    .filter(AnalysisResult.channel_id == channel.id)
                    .order_by(AnalysisResult.analyzed_at.desc())
                    .first()
                )
                score = latest.overall_score if latest else 0
                candidates.append((channel, old_v, new_v, percent, score))

    if not candidates:
        return False

    candidates.sort(key=lambda x: x[3], reverse=True)
    channel, old_v, new_v, percent, score = candidates[0]

    text = random.choice(ANOMALY_TEMPLATES).format(
        display_name=channel.display_name,
        platform=channel.platform.capitalize(),
        old_viewers=old_v,
        new_viewers=new_v,
        percent=round(percent),
        score=round(score),
        url=_channel_url(channel.platform, channel.username),
    )
    return _post_tweet(db, text, "anomaly", channel.id)


def _try_daily_recap_tweet(db: Session) -> bool:
    """Post a daily recap of platform stats."""
    if _was_recently_tweeted(db, None, "daily_recap", hours=22):
        return False

    count = db.query(Channel).count()
    if count == 0:
        return False

    # Get latest score per channel
    subq = (
        db.query(
            AnalysisResult.channel_id,
            func.max(AnalysisResult.analyzed_at).label("latest"),
        )
        .group_by(AnalysisResult.channel_id)
        .subquery()
    )
    results = (
        db.query(AnalysisResult, Channel)
        .join(subq, (AnalysisResult.channel_id == subq.c.channel_id) & (AnalysisResult.analyzed_at == subq.c.latest))
        .join(Channel, AnalysisResult.channel_id == Channel.id)
        .order_by(AnalysisResult.overall_score.desc())
        .all()
    )

    if not results:
        return False

    top_ar, top_ch = results[0]
    avg = sum(ar.overall_score for ar, _ in results) / len(results)

    text = random.choice(DAILY_RECAP_TEMPLATES).format(
        count=count,
        top_channel=top_ch.display_name,
        top_score=round(top_ar.overall_score),
        avg_score=round(avg),
        site_url=settings.SITE_URL,
    )
    return _post_tweet(db, text, "daily_recap")


async def post_interesting_tweet():
    """
    Main entry point — called by the scheduler.
    Tries different tweet types in priority order.
    Posts at most ONE tweet per invocation.
    """
    db = SessionLocal()
    try:
        # Priority order: anomaly > score_change > high_score > daily_recap > milestone
        strategies = [
            ("anomaly", _try_anomaly_tweet),
            ("score_change", _try_score_change_tweet),
            ("high_score", _try_high_score_tweet),
            ("daily_recap", _try_daily_recap_tweet),
            ("milestone", _try_milestone_tweet),
        ]

        for name, strategy in strategies:
            try:
                if strategy(db):
                    logger.info("Posted tweet type: %s", name)
                    return
            except Exception as e:
                logger.error("Tweet strategy %s failed: %s", name, e)
                continue

        logger.info("No interesting stats to tweet right now")
    finally:
        db.close()
