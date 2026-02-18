import json
import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    TWITCH_CLIENT_ID: str = ""
    TWITCH_CLIENT_SECRET: str = ""
    YOUTUBE_API_KEY: str = ""
    STREAMORACLE_DB_URL: str = "sqlite:///./data/streamoracle.db"
    BACKEND_HOST: str = "0.0.0.0"
    BACKEND_PORT: int = 8877
    CORS_ORIGINS: str = '["http://localhost:3000"]'
    COLLECT_INTERVAL_MINUTES: int = 5
    ANALYZE_INTERVAL_MINUTES: int = 30

    # Twitter/X API credentials (leave empty to disable tweeting)
    TWITTER_API_KEY: str = ""
    TWITTER_API_SECRET: str = ""
    TWITTER_ACCESS_TOKEN: str = ""
    TWITTER_ACCESS_TOKEN_SECRET: str = ""
    TWITTER_BEARER_TOKEN: str = ""
    TWEET_INTERVAL_HOURS: int = 4
    SITE_URL: str = "https://frontend-production-bdacc.up.railway.app"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}

    @property
    def DATABASE_URL(self) -> str:
        return self.STREAMORACLE_DB_URL

    def get_cors_origins(self) -> list[str]:
        try:
            origins = json.loads(self.CORS_ORIGINS)
            if isinstance(origins, list):
                return origins
        except (json.JSONDecodeError, TypeError):
            pass
        if self.CORS_ORIGINS:
            return [o.strip() for o in self.CORS_ORIGINS.split(",")]
        return ["http://localhost:3000"]


settings = Settings()
