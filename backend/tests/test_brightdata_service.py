import os
import time
import json
import requests
from dotenv import load_dotenv

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

    if not all([API_TOKEN, COLLECTOR_ID, SUPABASE_URL, SUPABASE_ANON_KEY]):
        print("Error: Missing some env variables")
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
        "supabase_url": SUPABASE_URL,
        "supabase_anon_key": SUPABASE_ANON_KEY,
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
                    print("UPDATE -> Data collected successfully!")
                    
                    for item in data:
                        if isinstance(item, dict):
                            item.pop("input", None)
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

    output_file = "pipeline_results.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        
    print(f"UPDATE -> Results successfully saved to {output_file}!")

if __name__ == "__main__":
    main()
