import json
import logging
import os

logger = logging.getLogger(__name__)

DEFAULT_WEIGHTS = {
    "cvr": 0.25,
    "step_function": 0.20,
    "chat_entropy": 0.15,
    "follower_ratio": 0.10,
    "growth": 0.10,
    "benford": 0.10,
    "temporal": 0.10,
}

SIGNAL_WEIGHTS: dict[str, float] = {}

_weights_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "signal_weights.json")
_weights_path = os.path.normpath(_weights_path)

try:
    with open(_weights_path) as f:
        SIGNAL_WEIGHTS = json.load(f)
    logger.info("Loaded signal weights from %s", _weights_path)
except (FileNotFoundError, json.JSONDecodeError):
    SIGNAL_WEIGHTS = DEFAULT_WEIGHTS.copy()
    logger.info("Using default signal weights")
