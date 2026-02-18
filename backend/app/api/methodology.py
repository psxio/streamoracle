from fastapi import APIRouter

router = APIRouter(prefix="/api/v1", tags=["methodology"])

SIGNALS = [
    {"name": "Concurrent Viewer Ratio (CVR)", "weight": 0.25, "description": "Ratio of chatters to viewers; abnormally low chat participation suggests inflated viewers."},
    {"name": "Step Function Detection", "weight": 0.20, "description": "Detects sudden jumps or drops in viewer count that don't follow organic growth patterns."},
    {"name": "Chat Entropy", "weight": 0.15, "description": "Shannon entropy of chat messages; bot-driven chats tend to have lower diversity and entropy."},
    {"name": "Follower Ratio", "weight": 0.10, "description": "Ratio of followers to peak viewers; organic channels maintain stable follower-to-viewer ratios."},
    {"name": "Growth Trajectory", "weight": 0.10, "description": "Analyzes channel growth patterns for signs of artificial inflation or unnatural spikes."},
    {"name": "Benford's Law", "weight": 0.10, "description": "Tests if viewer count leading-digit distributions match the expected natural logarithmic pattern."},
    {"name": "Temporal Pattern", "weight": 0.10, "description": "Analyzes time-of-day viewing patterns for non-organic consistency across sessions."},
]

FORMULA = "final_score = \u03a3(score \u00d7 weight \u00d7 confidence) / \u03a3(weight \u00d7 confidence)"

LABELS = {
    "0-20": "Normal",
    "21-40": "Low",
    "41-60": "Moderate",
    "61-80": "Elevated",
    "81-100": "High",
}


@router.get("/methodology")
async def get_methodology():
    return {
        "signals": SIGNALS,
        "formula": FORMULA,
        "labels": LABELS,
    }
