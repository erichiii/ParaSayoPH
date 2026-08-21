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
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") 

    if not all([API_TOKEN, COLLECTOR_ID, SUPABASE_URL, SUPABASE_SERVICE_KEY]):
        print("Error: Missing some env variables. Ensure SUPABASE_SERVICE_ROLE_KEY is set.")
        return

    try:
        with open("rules.json", "r", encoding="utf-8") as file:
            rules_dict = json.load(file)
            rules_string = json.dumps(rules_dict)
    except FileNotFoundError:
        print("Error: Need po yung rules.json sa root dir")
        return

    trigger_url = f"https://api.brightdata.com/dca/trigger?collector={COLLECTOR_ID}&queue_next=1"
    
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = [{
        "url": "https://scholarship.com.ph/", 
        "depth": 1,
        "rules": rules_string
    }]

    try:
        response = requests.post(trigger_url, headers=headers, json=payload)
        response.raise_for_status()
        collection_id = response.json().get("collection_id")
        print(f"Pipeline triggered successfully! Collection ID: {collection_id}")
    except requests.exceptions.RequestException as e:
        print(f"UPDATE -> Failed to trigger: {e}")
        return

    print("UPDATE -> Pawait po mga around 15 to 20 minutes 😭🙏")
    dataset_url = f"https://api.brightdata.com/dca/dataset?id={collection_id}&format=json"

    while True:
        try:
            res = requests.get(dataset_url, headers=headers)
            res.raise_for_status()
            
            text_data = res.text.strip()
            
            if not text_data:
                print("UPDATE -> No data available yet. Wait for 10s")
                time.sleep(10)
                continue

            try:
                data = res.json()
            except json.JSONDecodeError:
                try:
                    data = [json.loads(line) for line in text_data.split('\n') if line.strip()]
                except Exception as ex:
                    print(f"Error parsing dataset JSON Lines: {ex}")
                    time.sleep(10)
                    continue

            if isinstance(data, dict):
                print(f"currently: {data.get('status', 'running')}. UPDATE -> 'Di pa po tapos, updating every 1 min")
                time.sleep(60)
                continue
            
            if isinstance(data, list):
                if len(data) > 0:
                    print("UPDATE -> Data collected successfully! Sanitizing payload...")
                    
                    clean_data = []
                    for item in data:
                        if isinstance(item, dict):
                            item.pop("input", None)
                            
                            if "source" in item and "url" in item["source"]:
                                item["source_url"] = item["source"]["url"]
                            
                            clean_data.append(item)
                    
                    print("UPDATE -> Upserting to Supabase staging_scraper table...")
                    supabase_headers = {
                        "apikey": SUPABASE_SERVICE_KEY,
                        "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                        "Content-Type": "application/json",
                        "Prefer": "resolution=merge-duplicates" 
                    }
                    
                    upsert_endpoint = f"{SUPABASE_URL}/rest/v1/staging_scraper?on_conflict=source_url"
                    db_res = requests.post(upsert_endpoint, headers=supabase_headers, json=clean_data)
                    
                    if db_res.status_code in [200, 201, 204]:
                        print("UPDATE -> Successfully upserted data to Supabase!")
                    else:
                        print(f"UPDATE -> Supabase Upsert Failed: {db_res.status_code} - {db_res.text}")
                    
                    break
                else:
                    print("UPDATE -> empty dataset.")
                    break
            else:
                print("UPDATE -> Unexpected response format. Waiting 10s...")
                time.sleep(10)

        except requests.exceptions.RequestException as e:
            print(f"HTTP Error while polling: {e}")
            time.sleep(10)

if __name__ == "__main__":
    main()