import json

from google import genai
from google.genai import types

from config import GEMINI_API_KEY, GEMINI_MODEL

_INVOICE_PROMPT = """
Extract invoice details in STRICT JSON format:

{
 "invoiceNo": "",
 "vendorName": "",
 "panNo": "",
 "invoiceDate": "",
 "invoiceAmount": "",
 "placeofSupply": "",
 "customerAddress": "",
 "itemsList": [
  {
   "itemCode": "",
   "itemDescription": "",
   "quantity": "",
   "unitPrice": "",
   "itemNature": ""
  }
 ]
}

IMPORTANT:
- PAN/Aadhaar/bank/IFSC are removed from document
- If not present, keep empty
- Return ONLY JSON (no explanation, no markdown)
"""


def call_gemini(pdf_path: str) -> str:
    client = genai.Client(
        vertexai=True,
        api_key=GEMINI_API_KEY,
    )

    with open(pdf_path, "rb") as f:
        pdf_bytes = f.read()

    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
                types.Part.from_text(text=_INVOICE_PROMPT),
            ],
        )
    ]

    config = types.GenerateContentConfig(
        temperature=0.1,
        max_output_tokens=8192,
    )

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=contents,
        config=config,
    )

    if not response.candidates:
        raise RuntimeError("No response received from Gemini")

    return response.candidates[0].content.parts[0].text.strip()


def merge_pii(llm_output: str, pii: dict) -> dict:
    try:
        data = json.loads(llm_output)
    except json.JSONDecodeError as exc:
        raise ValueError("Gemini did not return valid JSON") from exc

    if pii.get("pan"):
        data["panNo"] = pii["pan"]

    data["aadhaar"] = pii.get("aadhaar", "")
    data["bankAccount"] = pii.get("bank", "")
    data["ifsc"] = pii.get("ifsc", "")

    return data
