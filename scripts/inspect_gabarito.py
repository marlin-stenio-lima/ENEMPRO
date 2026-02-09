import fitz
import os

# Path to a sample Gabarito file
# Using relative path from the project root
GABARITO_PATH = os.path.join('.', 'questoes e gabarito enem', 'gabarito das questoes do enem 2023 dia 1.pdf')

def inspect_gabarito():
    if not os.path.exists(GABARITO_PATH):
        print(f"File not found: {GABARITO_PATH}")
        return

    doc = fitz.open(GABARITO_PATH)
    print(f"Inspecting {GABARITO_PATH} - {len(doc)} pages")
    
    for page in doc:
        text = page.get_text()
        print("--- PAGE TEXT ---")
        print(text)
        print("-----------------")

if __name__ == "__main__":
    inspect_gabarito()
