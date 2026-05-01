# Oracle NetSuite Invoice Intelligence

A full-stack invoice ingestion pipeline that accepts PDF invoices, protects sensitive fields during LLM extraction, restores trusted PII after extraction, and updates Oracle NetSuite via API.

## Architecture Diagram

See separate diagram file: [ARCHITECTURE.md](ARCHITECTURE.md)

## Exact Functionality

When a PDF is uploaded from the frontend, the backend executes this exact flow:

1. Upload receive and validation
- Endpoint: POST /process-invoice
- Validates content type is application/pdf

2. Raw text extraction and PII detection (before LLM)
- Extracts full PDF text using PyMuPDF
- Detects sensitive fields using regex/context rules:
  - PAN
  - Aadhaar
  - IFSC
  - bank account
  - email
  - phone

3. PDF redaction for privacy-preserving LLM call
- Creates a redacted PDF by masking sensitive patterns (PAN/Aadhaar/bank/IFSC)
- Redacted version is the one sent to Gemini, not the original

4. Gemini structured extraction on redacted PDF
- Calls Gemini with the redacted PDF and strict JSON prompt
- Extracts invoice business fields such as invoiceNo, vendorName, invoiceDate, invoiceAmount, placeofSupply, customerAddress, itemsList

5. PII append/merge after model output
- Parses Gemini JSON output
- Appends trusted PII extracted in step 2 back into payload:
  - panNo (overwrites with securely extracted PAN when available)
  - aadhaar
  - bankAccount
  - ifsc

6. Oracle NetSuite API update
- Sends final merged invoice payload to Oracle NetSuite RESTlet URL
- Uses OAuth1 with HMAC-SHA256 signature in Authorization header
- Includes headers:
  - Content-Type: application/json
  - Prefer: transient
- Returns NetSuite status code and response body alongside pdf_output

## Project Structure

- backend/: FastAPI API, PII extraction/redaction, Gemini client, NetSuite client
- frontend/: React + Vite upload UI and response visualization

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

4. Fill required values in .env:

- GEMINI_API_KEY
- GEMINI_MODEL
- NETSUITE_URL
- NETSUITE_ACCOUNT_ID
- NETSUITE_CONSUMER_KEY
- NETSUITE_CONSUMER_SECRET
- NETSUITE_TOKEN_KEY
- NETSUITE_TOKEN_SECRET

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

Frontend runs at http://localhost:5173

Default frontend API path is /api/process-invoice (proxied by Vite to http://127.0.0.1:8000).

If backend runs on a different origin:

```bash
VITE_BACKEND_ORIGIN=http://127.0.0.1:7777 npm start
```

## API Endpoints

- GET /health
- POST /process-invoice

## API Commands

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Upload and process invoice:

```bash
curl -X POST \
  -F "file=@/absolute/path/to/invoice.pdf;type=application/pdf" \
  http://127.0.0.1:8000/process-invoice
```

## Security Notes

- Never commit .env files or real credentials.
- Keep secrets only in local environment variables or local .env.
- .gitignore excludes secret files and build/cache artifacts.
