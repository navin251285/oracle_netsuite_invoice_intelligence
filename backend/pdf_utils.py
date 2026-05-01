import fitz  # PyMuPDF


def extract_text(pdf_path: str) -> str:
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text


def redact_pdf(input_pdf: str, output_pdf: str) -> None:
    import re

    doc = fitz.open(input_pdf)

    patterns = [
        r"[A-Z]{5}[0-9]{4}[A-Z]",  # PAN
        r"\d{4}\s?\d{4}\s?\d{4}",  # Aadhaar
        r"\d{9,18}",               # Bank account
        r"[A-Z]{4}0[A-Z0-9]{6}",   # IFSC
    ]

    for page in doc:
        for pattern in patterns:
            instances = page.search_for(pattern)
            for inst in instances:
                page.add_redact_annot(inst, fill=(0, 0, 0))
        page.apply_redactions()

    doc.save(output_pdf)
