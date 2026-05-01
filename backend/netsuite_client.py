import requests
from requests_oauthlib import OAuth1

from config import (
    NETSUITE_URL,
    NETSUITE_ACCOUNT_ID,
    NETSUITE_CONSUMER_KEY,
    NETSUITE_CONSUMER_SECRET,
    NETSUITE_TOKEN_KEY,
    NETSUITE_TOKEN_SECRET,
)


def push_to_netsuite(payload: dict) -> dict:
    auth = OAuth1(
        client_key=NETSUITE_CONSUMER_KEY,
        client_secret=NETSUITE_CONSUMER_SECRET,
        resource_owner_key=NETSUITE_TOKEN_KEY,
        resource_owner_secret=NETSUITE_TOKEN_SECRET,
        signature_method="HMAC-SHA256",
        signature_type="AUTH_HEADER",
        realm=NETSUITE_ACCOUNT_ID,
    )

    headers = {
        "Content-Type": "application/json",
        "Prefer": "transient",
    }

    response = requests.post(
        NETSUITE_URL,
        json=payload,
        auth=auth,
        headers=headers,
        timeout=30,
    )

    return {
        "status_code": response.status_code,
        "response": response.text,
    }
