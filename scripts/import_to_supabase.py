import os
import json
import mimetypes
import requests
from dotenv import load_dotenv

# Load env from parent directory (or current)
load_dotenv()

# Configuration
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")
    exit(1)

OUTPUT_DIR = os.path.join('.', 'output')
BUCKET_NAME = "question-images"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}"
}

def upload_image(file_path, folder_name):
    """
    Uploads an image via Supabase Storage API.
    """
    filename = os.path.basename(file_path)
    blob_path = f"{folder_name}/{filename}"
    
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{blob_path}"
    
    mime_type, _ = mimetypes.guess_type(file_path)
    if not mime_type:
        mime_type = "application/octet-stream"

    try:
        with open(file_path, 'rb') as f:
            headers = HEADERS.copy()
            headers["Content-Type"] = mime_type
            headers["x-upsert"] = "true"
            
            response = requests.post(url, headers=headers, data=f)
            
            if response.status_code not in [200, 201]:
                print(f"  - Upload failed for {filename}: {response.text}")
    except Exception as e:
        print(f"  - Upload error for {filename}: {e}")

    # Public URL
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{blob_path}"

def parse_exam_name(exam_name):
    year = None
    day = None
    
    if "2023" in exam_name: year = 2023
    elif "2024" in exam_name: year = 2024
    
    if "dia 1" in exam_name.lower() or "dia1" in exam_name.lower(): day = 1
    elif "dia 2" in exam_name.lower() or "dia2" in exam_name.lower(): day = 2
    
    return year, day

def process_exam_folder(folder_name, folder_path):
    print(f"Processing Exam: {folder_name}")
    
    json_path = os.path.join(folder_path, "questions.json")
    if not os.path.exists(json_path):
        return

    with open(json_path, "r", encoding="utf-8") as f:
        questions = json.load(f)

    year, day = parse_exam_name(folder_name)
    rows_to_insert = []

    for q in questions:
        image_urls = []
        for img_file in q.get("images", []):
            img_path = os.path.join(folder_path, "images", img_file)
            if os.path.exists(img_path):
                url = upload_image(img_path, folder_name)
                image_urls.append(url)

        row = {
            "exam_name": folder_name,
            "year": year,
            "day": day,
            "question_number": q.get("number"),
            "text": q.get("text"),
            "answer": q.get("answer"),
            "page_number": q.get("page"),
            "images": image_urls
        }
        rows_to_insert.append(row)

    if rows_to_insert:
        url = f"{SUPABASE_URL}/rest/v1/questions"
        headers = HEADERS.copy()
        headers["Content-Type"] = "application/json"
        headers["Prefer"] = "return=representation" # or minimal
        
        # Batch insert? REST API limits usually exist. 
        # Supabase handles large batches well but let's be safe with chunking if needed.
        # 100 questions is fine.
        
        try:
            response = requests.post(url, headers=headers, json=rows_to_insert)
            if response.status_code == 201:
                print(f"  Inserted {len(rows_to_insert)} questions.")
            else:
                print(f"  Error inserting questions: {response.text}")
        except Exception as e:
            print(f"  Error inserting questions: {e}")

def main():
    if not os.path.exists(OUTPUT_DIR):
        print("Output directory not found.")
        return

    folders = [f for f in os.listdir(OUTPUT_DIR) if os.path.isdir(os.path.join(OUTPUT_DIR, f))]
    
    for folder in folders:
        if "Competencia" in folder:
             if not os.path.exists(os.path.join(OUTPUT_DIR, folder, "questions.json")):
                 continue
        
        if "gabarito" in folder.lower():
            continue

        process_exam_folder(folder, os.path.join(OUTPUT_DIR, folder))

    print("\nImport Complete!")

if __name__ == "__main__":
    main()
