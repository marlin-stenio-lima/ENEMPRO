import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Range": "0-0",
    "Prefer": "count=exact"
}

def check_count():
    url = f"{SUPABASE_URL}/rest/v1/questions"
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code in [200, 206]:
            content_range = response.headers.get("Content-Range")
            # Format: 0-0/COUNT
            if content_range:
                count = content_range.split('/')[-1]
                print(f"Total Questions in DB: {count}")
                
                # Fetch one question to verify
                clean_headers = HEADERS.copy()
                clean_headers.pop("Range", None)
                clean_headers.pop("Prefer", None)
                resp = requests.get(url + "?limit=1", headers=clean_headers)
                if resp.status_code == 200:
                    data = resp.json()
                    if data:
                        q = data[0]
                        print(f"Sample Question ID: {q.get('id')}")
                        print(f"Sample Images: {q.get('images')}")
                    else:
                        print("No questions returned in sample.")
                else:
                    print(f"Error fetching sample: {resp.text}")
            else:
                print("Could not determine count from headers.")
        else:
            print(f"Error checking count: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_count()
