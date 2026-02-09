import os
import requests
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def remove_duplicates():
    print("Fetching all questions...")
    # Fetch all questions (id, exam_name, question_number)
    # We need to page through results if there are many, but limit=1000 covers 740.
    url = f"{SUPABASE_URL}/rest/v1/questions?select=id,exam_name,question_number&limit=1000"
    
    response = requests.get(url, headers=HEADERS)
    if response.status_code != 200:
        print(f"Error fetching questions: {response.text}")
        return

    questions = response.json()
    print(f"Total questions fetched: {len(questions)}")

    # Group by key
    groups = {}
    for q in questions:
        key = (q.get('exam_name'), q.get('question_number'))
        if key not in groups:
            groups[key] = []
        groups[key].append(q)

    ids_to_delete = []
    
    for key, group in groups.items():
        if len(group) > 1:
            # Sort by ID descending (keep highest ID)
            group.sort(key=lambda x: x['id'], reverse=True)
            
            # Keep the first one (highest ID), delete the rest
            to_remove = group[1:]
            for item in to_remove:
                ids_to_delete.append(item['id'])
                
    print(f"Found {len(ids_to_delete)} duplicate records to delete.")

    if not ids_to_delete:
        print("No duplicates found.")
        return

    # Delete in batches of 50
    batch_size = 50
    for i in range(0, len(ids_to_delete), batch_size):
        batch = ids_to_delete[i:i+batch_size]
        batch_ids_str = ",".join(map(str, batch))
        
        delete_url = f"{SUPABASE_URL}/rest/v1/questions?id=in.({batch_ids_str})"
        print(f"Deleting batch {i} to {i+len(batch)}...")
        
        resp = requests.delete(delete_url, headers=HEADERS)
        if resp.status_code not in [200, 204]:
            print(f"Error deleting batch: {resp.text}")
        else:
            print("Batch deleted successfully.")

    print("Deduplication complete!")

if __name__ == "__main__":
    remove_duplicates()
