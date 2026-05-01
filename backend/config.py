import os
from dotenv import load_dotenv

load_dotenv()

# ─── Gemini / Vertex AI ───────────────────────────────────────────────────────
GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")
GEMINI_MODEL: str = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash-001")

# ─── NetSuite OAuth1 ─────────────────────────────────────────────────────────
NETSUITE_URL: str = os.environ.get(
    "NETSUITE_URL",
    "https://4074768.restlets.api.netsuite.com/app/site/hosting/restlet.nl?script=7457&deploy=1",
)
NETSUITE_ACCOUNT_ID: str = os.environ.get("NETSUITE_ACCOUNT_ID", "4074768")
NETSUITE_CONSUMER_KEY: str = os.environ.get("NETSUITE_CONSUMER_KEY", "")
NETSUITE_CONSUMER_SECRET: str = os.environ.get("NETSUITE_CONSUMER_SECRET", "")
NETSUITE_TOKEN_KEY: str = os.environ.get("NETSUITE_TOKEN_KEY", "")
NETSUITE_TOKEN_SECRET: str = os.environ.get("NETSUITE_TOKEN_SECRET", "")
