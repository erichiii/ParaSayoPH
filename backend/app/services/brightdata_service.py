import os
from pathlib import Path

import requests
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[3]
load_dotenv(ROOT_DIR / ".env")

BRIGHTDATA_TRIGGER_URL = "https://api.brightdata.com/dca/trigger"

def trigger_scraper(source_url: str):
    api_token = os.getenv("BRIGHTDATA_API_TOKEN")
    collector_id = os.getenv("BRIGHTDATA_COLLECTOR_ID")

    if not api_token:
        raise RuntimeError("BRIGHTDATA_API_TOKEN is not configured")

    if not collector_id:
        raise RuntimeError("BRIGHTDATA_COLLECTOR_ID is not configured")

    headers = {
        "Authorization": f"Bearer {api_token}",
        "Content-Type": "application/json",
    }

    params = {
        "collector": collector_id,
        "queue_next": "1",
    }

    data = [
        {
            "url": source_url,
        }
    ]

    response = requests.post(
        BRIGHTDATA_TRIGGER_URL,
        headers=headers,
        params=params,
        json=data,
        timeout=60,
    )

    response.raise_for_status()

    return response.json()