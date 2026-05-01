# Oracle NetSuite Invoice Intelligence

A full-stack app that uploads invoice PDFs, extracts structured invoice fields with Gemini, and pushes results to NetSuite.

## Project Structure

- `backend/` FastAPI API for PDF processing and NetSuite push
- `frontend/` React + Vite UI for upload and results visualization

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

## Backend Setup

1. Create and activate virtual environment:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create environment file from template:

```bash
cp .env.example .env
```

4. Set required values in `.env`:

- `GEMINI_API_KEY`
- `GEMINI_MODEL` (optional, default provided)
- `NETSUITE_URL`
- `NETSUITE_ACCOUNT_ID`
- `NETSUITE_CONSUMER_KEY`
- `NETSUITE_CONSUMER_SECRET`
- `NETSUITE_TOKEN_KEY`
- `NETSUITE_TOKEN_SECRET`

5. Run API:

```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

## Frontend Setup

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start dev server:

```bash
npm start
```

Frontend runs at `http://localhost:5173`.

By default, frontend sends requests to `/api/process-invoice` and Vite proxies to `http://127.0.0.1:8000`.

If backend runs elsewhere:

```bash
VITE_BACKEND_ORIGIN=http://127.0.0.1:7777 npm start
```

## API Endpoints

- `GET /health` health check
- `POST /process-invoice` upload and process invoice PDF

### Example API Calls

Health:

```bash
curl http://127.0.0.1:8000/health
```

Process PDF:

```bash
curl -X POST \
  -F "file=@/absolute/path/to/invoice.pdf;type=application/pdf" \
  http://127.0.0.1:8000/process-invoice
```

## Security Notes

- Never commit `.env` files or real credentials.
- Keep secrets only in local environment variables or local `.env`.
- `.gitignore` is configured to exclude secret and build/cache files.
