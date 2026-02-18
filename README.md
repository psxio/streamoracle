# StreamOracle

> **Live Demo**: https://frontend-production-bdacc.up.railway.app
>
> **API**: https://backend-production-44cf.up.railway.app/api/v1/health

**Multi-platform viewership analysis oracle for Twitch, YouTube, and Kick.**

StreamOracle is an open-source tool that aggregates statistical signals to score streamers on the likelihood of artificial viewership. It collects data from multiple platforms, runs 7 independent detection signals, and produces a transparent suspicion score with full methodology disclosure.

**Philosophy: Score, don't accuse.** StreamOracle presents statistical observations, not accusations. Every score includes a full breakdown of signals, weights, and confidence levels.

## Features

- **Multi-Platform Support** — Twitch, YouTube, and Kick
- **7 Detection Signals** — CVR, Step Function, Chat Entropy, Follower Ratio, Growth Trajectory, Benford's Law, Temporal Patterns
- **Transparent Methodology** — Every signal, weight, and calculation is open and explained
- **Real-Time Dashboard** — Track channels, view time-series data, and explore signal breakdowns
- **Suspicion Leaderboard** — Browse analyzed channels ranked by score
- **Automated Collection** — Background scheduler collects data every 5 minutes, analyzes every 30
- **Zero Infrastructure** — SQLite database, no external services needed

## Score Labels

| Score Range | Label | Meaning |
|-------------|-------|---------|
| 0–20 | Normal | No significant anomalies detected |
| 21–40 | Low | Minor statistical deviations |
| 41–60 | Moderate | Notable anomalies in some signals |
| 61–80 | Elevated | Multiple signals showing anomalies |
| 81–100 | High | Strong statistical indicators across signals |

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, Recharts |
| Backend | Python 3.11+, FastAPI, SQLAlchemy, httpx, APScheduler |
| Database | SQLite (WAL mode) |
| Deployment | Docker Compose |

## Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/psxio/streamoracle.git
cd streamoracle

# Configure environment
cp .env.example .env
# Edit .env with your API keys (see Environment Variables below)

# Start services
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Health Check: http://localhost:8000/api/v1/health

### Manual Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TWITCH_CLIENT_ID` | For Twitch | Twitch app client ID |
| `TWITCH_CLIENT_SECRET` | For Twitch | Twitch app client secret |
| `YOUTUBE_API_KEY` | For YouTube | YouTube Data API v3 key |
| `DATABASE_URL` | No | SQLite path (default: `sqlite:///./data/streamoracle.db`) |
| `BACKEND_HOST` | No | Backend host (default: `0.0.0.0`) |
| `BACKEND_PORT` | No | Backend port (default: `8000`) |
| `CORS_ORIGINS` | No | Allowed origins (default: `["http://localhost:3000"]`) |
| `NEXT_PUBLIC_API_URL` | No | Backend URL for frontend (default: `http://localhost:8000`) |
| `COLLECT_INTERVAL_MINUTES` | No | Collection frequency (default: `5`) |
| `ANALYZE_INTERVAL_MINUTES` | No | Analysis frequency (default: `30`) |

### Getting API Keys

**Twitch**: Create an application at [Twitch Developer Console](https://dev.twitch.tv/console). Use client credentials flow.

**YouTube**: Create an API key at [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and enable the YouTube Data API v3.

**Kick**: No API key required (uses public endpoints).

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/search?q=&platform=` | Search tracked channels |
| GET | `/api/v1/channels/{platform}/{username}` | Channel detail + latest analysis |
| GET | `/api/v1/channels/{platform}/{username}/snapshots?hours=24` | Viewer time-series data |
| POST | `/api/v1/channels/{platform}/{username}/track` | Start tracking a channel |
| GET | `/api/v1/analysis/{platform}/{username}/latest` | Latest score breakdown |
| GET | `/api/v1/leaderboard?platform=&category=&limit=50` | Suspicion leaderboard |

## Detection Signals

| Signal | Weight | What It Detects |
|--------|--------|----------------|
| **CVR** (Chatter-to-Viewer Ratio) | 25% | Organic channels have 5–20% chatters. Artificial inflation shows < 0.5%. |
| **Step Function** | 20% | Sharp viewer jumps (>15% change, >3σ from rolling mean) indicating bulk joins/leaves. |
| **Chat Entropy** | 15% | Shannon entropy of messages, unique message ratio, timing regularity. Low entropy = bot-like. |
| **Follower Ratio** | 10% | More concurrent viewers than followers is a strong anomaly indicator. |
| **Growth Trajectory** | 10% | Growth rate vs category norms. Organic streams show correlated viewer/chatter growth (r > 0.7). |
| **Benford's Law** | 10% | First-digit distribution of viewer counts. MAD > 0.015 deviates from natural patterns. |
| **Temporal Pattern** | 10% | Coefficient of variation of hourly averages. CV < 0.2 indicates unnaturally flat viewership. |

**Aggregation Formula:**
```
final_score = Σ(signal.score × weight × confidence) / Σ(weight × confidence)
```

## Project Structure

```
streamoracle/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── api/          # REST endpoints
│   │   ├── analysis/     # Detection engine + 7 signals
│   │   ├── collectors/   # Platform data collectors
│   │   ├── models/       # SQLAlchemy ORM models
│   │   ├── schemas/      # Pydantic request/response models
│   │   ├── scheduler/    # Background data collection jobs
│   │   └── utils/        # Rate limiter, helpers
│   └── data/             # SQLite database + config
├── frontend/         # Next.js frontend
│   └── src/
│       ├── app/          # Pages (App Router)
│       ├── components/   # React components
│       ├── hooks/        # Custom React hooks
│       └── lib/          # API client + types
├── docker-compose.yml
└── .env.example
```

## Disclaimer

StreamOracle provides **statistical analysis only**. Scores represent mathematical indicators of viewership patterns and should not be interpreted as definitive proof of any wrongdoing. Many legitimate factors (raids, hosts, viral moments, platform features) can trigger elevated scores. Always consider context when evaluating results.

## Author

Built by [@duhhhdev](https://x.com/duhhhdev) — [github.com/psxio](https://github.com/psxio)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT — see [LICENSE](LICENSE) for details.
