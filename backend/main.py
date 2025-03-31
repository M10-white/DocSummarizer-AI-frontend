import os
from extractor import extract_text_from_pdf, extract_text_from_docx
from summarizer import summarize_text

def main():
    file_path = input("Entrez le chemin du document à résumer : ")

    if not os.path.exists(file_path):
        print("Fichier introuvable.")
        return

    if file_path.endswith('.pdf'):
        text = extract_text_from_pdf(file_path)
    elif file_path.endswith('.docx'):
        text = extract_text_from_docx(file_path)
    else:
        print("Format non pris en charge (PDF ou DOCX uniquement).")
        return

    print("\nRésumé généré :\n")
    summary = summarize_text(text)
    print(summary)

    save = input("\nVoulez-vous sauvegarder le résumé ? (o/n) : ")
    if save.lower() == 'o':
        with open("resume.txt", "w") as f:
            f.write(summary)
        print("Résumé sauvegardé dans 'resume.txt'.")

if __name__ == "__main__":
    main()
