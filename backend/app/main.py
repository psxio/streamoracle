import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.api.health import router as health_router
from app.api.search import router as search_router
from app.api.channels import router as channels_router
from app.api.analysis import router as analysis_router
from app.api.leaderboard import router as leaderboard_router
from app.api.methodology import router as methodology_router
from app.api.tweets import router as tweets_router
from app.scheduler.jobs import start_scheduler, stop_scheduler
import app.models.tweet_log  # noqa: F401 — ensure table creation

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Creating database tables")
    Base.metadata.create_all(bind=engine)
    start_scheduler()
    logger.info("StreamOracle API started")
    yield
    # Shutdown
    stop_scheduler()
    logger.info("StreamOracle API stopped")


app = FastAPI(
    title="StreamOracle API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(search_router)
app.include_router(channels_router)
app.include_router(analysis_router)
app.include_router(leaderboard_router)
app.include_router(methodology_router)
app.include_router(tweets_router)
