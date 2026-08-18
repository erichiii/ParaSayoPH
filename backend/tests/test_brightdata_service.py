import os

import requests
from dotenv import load_dotenv


load_dotenv("../.env")

url = "https://api.brightdata.com/dca/trigger"

headers = {
    "Authorization": f"Bearer {os.getenv('BRIGHTDATA_API_TOKEN')}",
    "Content-Type": "application/json",
}

params = {
    "collector": os.getenv("BRIGHTDATA_COLLECTOR_ID"),
    "queue_next": "1",
}

data = [
    {
        "url": "https://scholarship.com.ph/"
    }
]

print("Triggering Bright Data...")

response = requests.post(
    url,
    headers=headers,
    params=params,
    json=data,
    timeout=120,
)

print("Status:", response.status_code)
print("Response:", response.text)