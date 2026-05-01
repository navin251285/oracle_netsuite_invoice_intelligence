import os
import tempfile

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from gemini_client import call_gemini, merge_pii
from netsuite_client import push_to_netsuite
from pdf_utils import extract_text, redact_pdf
from pii_extractor import extract_pii

app = FastAPI(title="Invoice Processing API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"https?://(localhost|127\\.0\\.0\\.1)(:\\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/process-invoice", summary="Extract structured data from an invoice PDF")
async def process_invoice(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    pdf_bytes = await file.read()

    with tempfile.TemporaryDirectory() as tmp_dir:
        input_path = os.path.join(tmp_dir, "input.pdf")
        redacted_path = os.path.join(tmp_dir, "redacted.pdf")

        with open(input_path, "wb") as f:
            f.write(pdf_bytes)

        # Step 1: Extract raw text and PII before redaction
        text = extract_text(input_path)
        pii = extract_pii(text)

        # Step 2: Redact PII from PDF before sending to LLM
        redact_pdf(input_path, redacted_path)

        # Step 3: Call Gemini with redacted PDF
        llm_output = call_gemini(redacted_path)

        # Step 4: Merge securely extracted PII back into result
        result = merge_pii(llm_output, pii)

    # Step 5: Push to NetSuite and return combined response
    netsuite_response = push_to_netsuite(result)

    return JSONResponse(content={
        "pdf_output": result,
        "net_suite_api_response": netsuite_response,
    })


@app.get("/health")
async def health():
    return {"status": "ok"}
