import os
from extractor import extract_text_from_pdf, extract_text_from_docx
from summarizer import summarize_chunk

def chunk_text(text, max_chunk_length=1200):
    paragraphs = text.split('\n')
    chunks = []
    current_chunk = ''

    for para in paragraphs:
        para = para.strip()
        if not para:
            continue  # Ignore lignes vides
        if len(current_chunk) + len(para) < max_chunk_length:
            current_chunk += para + '\n'
        else:
            chunks.append(current_chunk.strip())
            current_chunk = para + '\n'

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

def summarize_text_full(text):
    chunks = chunk_text(text)
    full_summary = ""
    for i, chunk in enumerate(chunks):
        print(f"\n🧠 Résumé du bloc {i+1}/{len(chunks)}...")
        try:
            summary = summarize_chunk(chunk)
            full_summary += summary.strip() + "\n\n"
        except Exception as e:
            print(f"❌ Erreur sur le bloc {i+1} : {e}")
    return full_summary.strip()

def main():
    file_path = "files/" + input("Entrez le chemin du document à résumer : ")

    if not os.path.exists(file_path):
        print("❌ Fichier introuvable.")
        return

    if file_path.endswith('.pdf'):
        text = extract_text_from_pdf(file_path)
    elif file_path.endswith('.docx'):
        text = extract_text_from_docx(file_path)
    else:
        print("❌ Format non pris en charge (PDF ou DOCX uniquement).")
        return

    print("\n📄 Résumé généré :\n")
    summary = summarize_text_full(text)
    print(summary)

    save = input("\n💾 Voulez-vous sauvegarder le résumé ? (o/n) : ")
    if save.lower() == 'o':
        with open("resume.txt", "w") as f:
            f.write(summary)
        print("✅ Résumé sauvegardé dans 'resume.txt'.")

if __name__ == "__main__":
    main()
