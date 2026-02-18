# Contributing to StreamOracle

Thank you for your interest in contributing to StreamOracle! This guide will help you get started.

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 20+
- Git

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
cp ../.env.example ../.env
# Edit .env with your API keys
uvicorn app.main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Docker Setup
```bash
cp .env.example .env
# Edit .env with your API keys
docker compose up --build
```

## Project Structure

- `backend/` — Python/FastAPI backend with analysis engine
- `frontend/` — Next.js/React frontend dashboard
- `docker-compose.yml` — Container orchestration

## Code Style

### Python (Backend)
- Follow PEP 8
- Use type hints
- Use async/await for I/O operations
- Keep functions focused and testable

### TypeScript (Frontend)
- Follow the existing ESLint configuration
- Use TypeScript strict mode
- Prefer functional components with hooks

## Language Guidelines

StreamOracle is designed to **score, not accuse**. Please follow these guidelines:

- **Never** use words like "botted", "fake", "cheating", or "fraud"
- **Always** use "suspicion score", "artificial viewership indicators", or "statistical anomaly"
- Use the label system: Normal, Low, Moderate, Elevated, High
- Present findings as statistical observations, not accusations

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `cd backend && pytest`
5. Run linting: `cd frontend && npm run lint`
6. Commit with a descriptive message
7. Push and open a Pull Request

## Adding New Detection Signals

1. Create a new file in `backend/app/analysis/signals/`
2. Inherit from `AbstractSignal` in `base.py`
3. Implement `name`, `weight`, and `calculate()` methods
4. Register the signal in `backend/app/analysis/engine.py`
5. Add the weight to `backend/data/signal_weights.json`
6. Update the methodology page in the frontend

## Reporting Issues

- Use GitHub Issues
- Include steps to reproduce
- Include expected vs actual behavior
- Include environment details (OS, Python/Node version)

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
