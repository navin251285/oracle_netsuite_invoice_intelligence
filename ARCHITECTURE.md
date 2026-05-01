# Architecture Diagram

## System Components

- Frontend (React + Vite)
- Backend API (FastAPI)
- PII Layer (text extraction + PII detection + redaction)
- Gemini extraction service
- Oracle NetSuite RESTlet API

## Flow Diagram

```mermaid
flowchart TD
  U[User uploads PDF in Frontend] --> F[Frontend POST /api/process-invoice]
  F --> B[FastAPI /process-invoice]

  B --> T[Extract raw text from original PDF]
  T --> P[Extract PII: PAN Aadhaar IFSC Bank Email Phone]

  B --> R[Redact sensitive patterns in PDF]
  R --> G[Send redacted PDF + strict JSON prompt to Gemini]
  G --> J[Receive structured invoice JSON]

  P --> M[Merge trusted PII back into Gemini JSON]
  J --> M

  M --> N[POST merged payload to Oracle NetSuite RESTlet]
  N --> NR[NetSuite response status/body]

  M --> O[pdf_output]
  NR --> O2[net_suite_api_response]

  O --> RESP[API JSON response]
  O2 --> RESP
  RESP --> F2[Frontend renders PDF output and NetSuite response]
```

## Responsibilities by Module

- backend/main.py: API orchestration for upload, processing, and response composition
- backend/pdf_utils.py: PDF text extraction and redaction operations
- backend/pii_extractor.py: Sensitive data extraction rules and heuristics
- backend/gemini_client.py: Gemini call and post-processing merge_pii
- backend/netsuite_client.py: OAuth1-authenticated NetSuite API update

## NetSuite Update Details

- Auth method: OAuth1 (HMAC-SHA256, Authorization header)
- Request: POST JSON payload to NETSUITE_URL
- Returned to client:
  - status_code
  - raw response body
