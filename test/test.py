import os
import time
import json
import requests
from dotenv import load_dotenv

def main():
    load_dotenv()

    API_TOKEN = os.getenv("BRIGHTDATA_API_TOKEN")
    COLLECTOR_ID = os.getenv("BRIGHTDATA_COLLECTOR_ID")
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

    trigger_url = f"https://api.brightdata.com/dca/trigger?collector={COLLECTOR_ID}&queue_next=1"
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = [{
        "url": "https://scholarship.com.ph/", 
        "depth": 1,
        "supabase_url": SUPABASE_URL,
        "supabase_anon_key": SUPABASE_ANON_KEY
    }]

    try:
        response = requests.post(trigger_url, headers=headers, json=payload)
        response.raise_for_status()
        collection_id = response.json().get("collection_id")

        print(f"UPDATE -> Triggered Collection ID: {collection_id}")

    except requests.exceptions.RequestException as e:
        print(f"UPDATE -> Failed to trigger: {e}")
        return

    print("UPDATE -> Pawait po mga around 15 to 20 minutes 😭🙏")
    dataset_url = f"https://api.brightdata.com/dca/dataset?id={collection_id}"

    while True:
        try:
            res = requests.get(dataset_url, headers=headers)
            res.raise_for_status()
            data = res.json()

            if isinstance(data, list):
                print("Data collected successfully!")
                break

            else:
                print("UPDATE -> Hindi pa po tapos, updating every 30 seconds...")
                time.sleep(30)
                
        except requests.exceptions.RequestException as e:
            print(f"UPDATE -> Error while polling: {e}")
            time.sleep(30) 

    output_file = "pipeline_results.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"UPDATE -> Results successfully saved to {output_file}")

if __name__ == "__main__":
    main()