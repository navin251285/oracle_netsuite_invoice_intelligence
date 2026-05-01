import re


def normalize_text(text: str) -> str:
    text = text.upper()
    repl = {"O": "0", "I": "1", "L": "1", "S": "5"}
    for k, v in repl.items():
        text = text.replace(k, v)
    text = re.sub(r"\s+", " ", text)
    return text


def extract_pan_from_gstin(text: str) -> list[str]:
    gstin_pattern = r"\b\d{2}[A-Z]{5}[0-9]{4}[A-Z][A-Z0-9]{3}\b"
    gstins = re.findall(gstin_pattern, text)
    return [gstin[2:12] for gstin in gstins]


def extract_pan_with_context(text: str, candidates: list[str]) -> str:
    if not candidates:
        return ""

    best_pan = ""
    best_score = -1

    for pan in candidates:
        pos = text.find(pan)
        start = max(0, pos - 100)
        end = min(len(text), pos + 100)
        context = text[start:end].lower()

        score = 0
        if "vendor" in context or "supplier" in context:
            score += 3
        if "gst" in context:
            score += 2
        if "bill to" in context or "customer" in context:
            score -= 2

        if score > best_score:
            best_score = score
            best_pan = pan

    return best_pan


def extract_pan(text: str) -> str:
    t = normalize_text(text)
    m = re.findall(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", t)
    return m[0] if m else ""


def extract_aadhaar(text: str) -> str:
    t = normalize_text(text)
    m = re.findall(r"\b\d{4}\s?\d{4}\s?\d{4}\b", t)
    return m[0].replace(" ", "") if m else ""


def extract_ifsc(text: str) -> str:
    t = normalize_text(text)
    m = re.findall(r"\b[A-Z]{4}0[A-Z0-9]{6}\b", t)
    return m[0] if m else ""


def extract_bank_account(text: str) -> str:
    t = normalize_text(text)
    candidates = re.findall(r"\b\d{9,18}\b", t)
    if not candidates:
        return ""

    best = ""
    best_score = -1

    for c in candidates:
        pos = t.find(c)
        ctx = t[max(0, pos - 60): pos + 60]
        score = 0
        if any(k in ctx for k in ["ACCOUNT", "A/C", "AC NO", "ACC"]):
            score += 3
        if "IFSC" in ctx:
            score += 1
        if any(k in ctx for k in ["INVOICE", "BILL"]):
            score -= 2
        if score > best_score:
            best_score = score
            best = c

    return best


def extract_email(text: str) -> str:
    m = re.findall(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}", text)
    return m[0] if m else ""


def extract_phone(text: str) -> str:
    t = normalize_text(text)
    m = re.findall(r"(\+91[\s-]?\d{10}|\b\d{10}\b)", t)
    return m[0].replace(" ", "").replace("-", "") if m else ""


def extract_pii(text: str) -> dict:
    direct_pans = re.findall(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", text)
    gstin_pans = extract_pan_from_gstin(text)
    all_pans = list(set(direct_pans + gstin_pans))

    return {
        "pan": extract_pan_with_context(text, all_pans) if all_pans else extract_pan(text),
        "aadhaar": extract_aadhaar(text),
        "ifsc": extract_ifsc(text),
        "bank": extract_bank_account(text),
        "email": extract_email(text),
        "phone": extract_phone(text),
    }
