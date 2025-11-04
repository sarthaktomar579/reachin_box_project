# ReachInbox OneBox – AI-Powered Email Aggregator

A full-stack email unification app that ingests messages via IMAP, indexes them for search, auto-categorizes using AI, and exposes a simple UI and API.

## Features
- Aggregates emails from IMAP inboxes
- Elasticsearch-backed search (subject/body/from)
- AI categorization (Interested, Meeting Booked, Not Interested, Spam, Out of Office)
- Suggested reply generation
- Webhooks and Slack notifications for Interested leads
- Socket.io realtime updates
- Dummy mode to run without any environment keys or external services

## Tech Stack
- Backend: Node.js, Express, TypeScript, Mongoose
- AI: OpenAI (optional; mocked in dummy mode)
- Search: Elasticsearch (optional; skipped in dummy mode)
- Realtime: Socket.io
- Frontend: React + Vite + TypeScript

## Project Structure
```
backend/
  src/
    controllers/
    middleware/
    models/
    routes/
    services/
    mock/dummyData.ts      # 30-day demo emails + accounts
    config/runtime.ts      # dummy-mode detection
    server.ts              # app entry
frontend/
  src/
  vite.config.ts
```

## Prerequisites
- Node.js 18+
- npm 9+

Elasticsearch, MongoDB, and OpenAI are optional for local dev because the project supports dummy mode.

## Quick Start (Dummy Mode – no env keys required)
Dummy mode auto-enables when `MONGODB_URI` is not set. It:
- Serves mock accounts and 30 days of fake emails
- Skips MongoDB/Elasticsearch/IMAP
- Uses canned/heuristic AI responses

1) Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

2) Start backend (dummy mode)
```bash
cd backend
npm run dev
```
You should see a log similar to:
```
⚠️ Running in DUMMY MODE: no env keys detected. Using mock data.
🧪 Dummy mode: skipping MongoDB, Elasticsearch, and IMAP
```

3) Start frontend
```bash
cd ../frontend
npm run dev
```
By default Vite serves at `http://localhost:5173`.

### Useful API endpoints (dummy mode)
- Health: `GET http://localhost:5000/api/health`
- Emails (latest first): `GET http://localhost:5000/api/emails?limit=100`
  - Filters: `account`, `folder`, `category`
- Search emails: `GET http://localhost:5000/api/emails/search?q=interested`
- Get email by id: `GET http://localhost:5000/api/emails/1`
- Suggested reply: `GET http://localhost:5000/api/emails/1/suggested-reply`
- Accounts: `GET http://localhost:5000/api/accounts`

## Full Setup (Normal Mode – with real services)
Create `backend/.env` with:
```
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/reachinbox

# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200

# OpenAI (optional but recommended)
OPENAI_API_KEY=sk-...

# IMAP accounts (comma-separated lists aligned by index)
IMAP_ACCOUNTS=demo@acme.com,sales@acme.com
IMAP_PASSWORDS=pass1,pass2
IMAP_HOSTS=imap.gmail.com,imap.gmail.com
IMAP_PORTS=993,993

# Integrations (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
EXTERNAL_WEBHOOK_URL=https://your-app.com/webhooks/email
```

Then:
```bash
# Start Elasticsearch + MongoDB locally (example via Docker)
# docker run -p 9200:9200 -e discovery.type=single-node docker.elastic.co/elasticsearch/elasticsearch:8.15.0
# docker run -p 27017:27017 mongo:6

cd backend
npm run dev
```
You should now see DB connect, ES init, and IMAP sync logs.

## How Dummy Mode Works
- `backend/src/config/runtime.ts` sets `isDummyMode = !process.env.MONGODB_URI`.
- `server.ts` skips MongoDB/Elasticsearch/IMAP in dummy mode but still starts the API server.
- `controllers/emailController.ts` serves `dummyData` and performs in-memory filtering/searching when in dummy mode.
- `services/ragService.ts` and `services/aiCategorizationService.ts` lazily init OpenAI only if a key exists; otherwise they return deterministic mock outputs.
- `services/elasticsearchService.ts` no-ops in dummy mode.

## Scripts
Backend (`backend/package.json`):
- `npm run dev` – Start backend with ts-node-dev
- `npm run build` – TypeScript build
- `npm start` – Run compiled server

Frontend (`frontend/package.json`):
- `npm run dev` – Start Vite dev server
- `npm run build` – Build
- `npm run preview` – Preview build

## Troubleshooting
- Missing OpenAI key error: fixed by lazy initialization; ensure you’re on the latest code.
- Module not found `./config/elasticsearch`: resolved; server now imports from `./services/elasticsearchService`.
- Cannot connect to DB/ES/IMAP: run in dummy mode without env keys, or provide valid service instances and `.env`.

## License
MIT


