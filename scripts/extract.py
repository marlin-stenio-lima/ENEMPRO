import os
import fitz  # PyMuPDF
from PIL import Image
import io
import json
import re

# Configuration
INPUT_FOLDERS = [
    os.path.join('.', 'questoes e gabarito enem'),
    os.path.join('.', 'redação competencias')
]
OUTPUT_FOLDER = os.path.join('.', 'output')
DPI = 300

def ensure_folders():
    if not os.path.exists(OUTPUT_FOLDER):
        os.makedirs(OUTPUT_FOLDER)
    
    for folder in INPUT_FOLDERS:
        if not os.path.exists(folder):
            print(f"Warning: Input folder not found: {folder}")

def get_text_blocks(page):
    """
    Extracts text blocks and sorts them processing column 1 then column 2.
    """
    blocks = page.get_text("dict")["blocks"]
    width = page.rect.width
    mid_x = width / 2
    
    col1 = []
    col2 = []
    
    for b in blocks:
        if b['type'] == 0:  # Text block
            bbox = b['bbox']
            # Heuristic: if the center of the block is left of mid_x, it's col 1
            if (bbox[0] + bbox[2]) / 2 < mid_x:
                col1.append(b)
            else:
                col2.append(b)
    
    # Sort vertically
    col1.sort(key=lambda b: b['bbox'][1])
    col2.sort(key=lambda b: b['bbox'][1])
    
    return col1 + col2

def parse_gabarito(pdf_path):
    """
    Parses a Gabarito PDF and returns a dict mapping question number to answer.
    Handles English/Spanish split for questions 1-5.
    Returns: { "1": {"english": "A", "spanish": "B"}, "6": "C", ... }
    """
    print(f"Parsing Gabarito: {pdf_path}")
    doc = fitz.open(pdf_path)
    answers = {}
    
    # Heuristic parsing for the column format seen in inspection
    # We'll extract all text words and reconstruct the table
    for page in doc:
        words = page.get_text("words")
        # word format: (x0, y0, x1, y1, "string", block_no, line_no, word_no)
        # We look for rows where Q number aligns with Answer letter
        
        # Simple finite state machine or line-by-line processing might be brittle due to PDF layout.
        # Let's try collecting by Y-coordinate rows.
        rows = {}
        for w in words:
            y_mid = int((w[1] + w[3]) / 2)
            # Group by approximate Y line (allow 5px jitter)
            found_row = -1
            for y in rows:
                if abs(y - y_mid) < 5:
                    found_row = y
                    break
            if found_row == -1:
                found_row = y_mid
                rows[found_row] = []
            
            rows[found_row].append(w)

        # Process rows sorted by Y
        sorted_ys = sorted(rows.keys())
        
        # Context flags
        in_foreign_lang_section = False
        
        for y in sorted_ys:
            line_words = sorted(rows[y], key=lambda w: w[0])
            text = " ".join([w[4] for w in line_words]).upper()
            
            # Detect header for foreign languages
            if "INGLÊS" in text and "ESPANHOL" in text:
                in_foreign_lang_section = True
                continue
            
            # Identify data lines
            # Format 1: "1 B A" (Question English Spanish) - in foreign section
            # Format 2: "6 D" (Question Answer)
            
            # Extract numbers and single letters
            tokens = [w[4] for w in line_words]
            
            # Filter for pure digits and valid options (A-E)
            clean_tokens = []
            for t in tokens:
                if t.isdigit() or (len(t) == 1 and t in "ABCDE"):
                    clean_tokens.append(t)
            
            if not clean_tokens:
                continue
                
            # Heuristic logic
            try:
                # Case: Question Number first
                q_num = ""
                if clean_tokens[0].isdigit():
                    q_num = clean_tokens[0]
                    
                    if in_foreign_lang_section and int(q_num) <= 5:
                        # Expecting Num, Answer1, Answer2
                        if len(clean_tokens) >= 3:
                            answers[q_num] = {
                                "english": clean_tokens[1],
                                "spanish": clean_tokens[2]
                            }
                    else:
                        # Expecting Num, Answer
                        if len(clean_tokens) >= 2:
                            answers[q_num] = clean_tokens[1]
                
                # Sometimes the layout is: Questao Gabarito Questao Gabarito
                # e.g. "46 C 91 B"
                # We can iterate through tokens pairs? This is risky.
                # Let's look at the X coordinates to be safer.
                
            except Exception:
                continue

    return answers

def extract_questions_from_pdf(pdf_path, filename, answer_key=None):
    try:
        doc = fitz.open(pdf_path)
    except Exception as e:
        print(f"Error opening {filename}: {e}")
        return

    base_name = os.path.splitext(filename)[0]
    exam_output_folder = os.path.join(OUTPUT_FOLDER, base_name)
    images_output_folder = os.path.join(exam_output_folder, "images")
    if not os.path.exists(images_output_folder):
        os.makedirs(images_output_folder)

    print(f"Processing Questions: {filename}")
    
    questions_data = []
    current_question = None
    question_pattern = re.compile(r"QUESTÃO\s+(\d+)", re.IGNORECASE)

    for page_num, page in enumerate(doc):
        blocks = get_text_blocks(page)
        
        for block in blocks:
            text = ""
            for line in block["lines"]:
                for span in line["spans"]:
                    text += span["text"] + " "
            text = text.strip()
            
            match = question_pattern.search(text)
            if match:
                if current_question:
                    questions_data.append(current_question)
                
                q_num = match.group(1)
                
                # Fetch answer
                ans = None
                if answer_key and q_num in answer_key:
                    ans = answer_key[q_num]

                current_question = {
                    "number": q_num,
                    "text": text,
                    "answer": ans,
                    "images": [],
                    "page": page_num + 1,
                    "exam": filename
                }
            else:
                if current_question:
                    current_question["text"] += "\n" + text

        # Image extraction associated with current question
        images = page.get_images(full=True)
        for img_index, img in enumerate(images):
            # ... (Image saving code unchanged, omitted for brevity in thought, but included in tool call)
            # RE-INCLUDING IMAGE CODE
            xref = img[0]
            try:
                base_image = doc.extract_image(xref)
                image_bytes = base_image["image"]
                image_ext = base_image["ext"]
                image_filename = f"p{page_num+1}_img{img_index}.{image_ext}"
                image_path = os.path.join(images_output_folder, image_filename)
                with open(image_path, "wb") as f:
                    f.write(image_bytes)
                if current_question:
                    current_question["images"].append(image_filename)
            except:
                pass

    if current_question:
        questions_data.append(current_question)

    json_path = os.path.join(exam_output_folder, "questions.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(questions_data, f, indent=4, ensure_ascii=False)

def main():
    ensure_folders()
    
    # 1. Index all files
    all_files = []
    for input_folder in INPUT_FOLDERS:
        if os.path.exists(input_folder):
            for f in os.listdir(input_folder):
                if f.lower().endswith('.pdf'):
                    all_files.append( (f, os.path.join(input_folder, f)) )

    # 2. Categorize
    questions_files = []
    gabarito_files = []
    
    for name, path in all_files:
        if "gabarito" in name.lower():
            gabarito_files.append((name, path))
        else:
            questions_files.append((name, path))

    # 3. Build Answer Map from Gabaritos
    # Map key: (year, day) -> answers_dict
    gabarito_map = {}
    
    for name, path in gabarito_files:
        # Determine Year and Day
        year = "unknown"
        day = "unknown"
        
        if "2023" in name: year = "2023"
        elif "2024" in name: year = "2024"
        
        if "dia 1" in name.lower() or "dia1" in name.lower(): day = "1"
        elif "dia 2" in name.lower() or "dia2" in name.lower(): day = "2"
        
        print(f"Gabarito Identified: Year={year}, Day={day} ({name})")
        answers = parse_gabarito(path)
        gabarito_map[(year, day)] = answers

    # 4. Process Questions matching Year/Day
    for name, path in questions_files:
        # Skip non-exam files if any
        if "competencia" in name.lower():
            continue
            
        year = "unknown"
        day = "unknown"
        if "2023" in name: year = "2023"
        elif "2024" in name: year = "2024"
        
        if "dia 1" in name.lower() or "dia1" in name.lower(): day = "1"
        elif "dia 2" in name.lower() or "dia2" in name.lower(): day = "2"
        
        key = (year, day)
        ak = gabarito_map.get(key)
        
        if ak:
            print(f"Matched Answer Key for {name}")
        else:
            print(f"NO Answer Key found for {name} (Year: {year}, Day: {day})")
            
        extract_questions_from_pdf(path, name, ak)

if __name__ == "__main__":
    main()
