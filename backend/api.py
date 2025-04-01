from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
from extractor import extract_text_from_pdf, extract_text_from_docx
from summarizer import summarize_text_full

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/summarize")
async def summarize(file: UploadFile = File(...)):
    contents = await file.read()
    filename = file.filename.lower()

    try:
        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(contents)
        elif filename.endswith(".docx"):
            text = extract_text_from_docx(contents)
        else:
            return {"summary": "❌ Format non pris en charge."}
    except Exception as e:
        return {"summary": f"❌ Erreur pendant l'extraction du texte : {str(e)}"}

    summary = summarize_text_full(text)
    return {"summary": summary}


@app.post("/extract")
async def extract_text(file: UploadFile = File(...)):
    filename = file.filename.lower()
    contents = await file.read()

    try:
        if filename.endswith(".pdf"):
            text = extract_text_from_pdf(contents)
        elif filename.endswith(".docx"):
            text = extract_text_from_docx(contents)
        else:
            return {"text": "[⛔ Format non supporté pour l’aperçu]"}
    except Exception as e:
        return {"text": f"[❌ Erreur lors de l’extraction : {str(e)}]"}

    return {"text": text[:3000]}

translator_en_fr = pipeline("translation_en_to_fr", model="Helsinki-NLP/opus-mt-en-fr")
translator_fr_en = pipeline("translation_fr_to_en", model="Helsinki-NLP/opus-mt-fr-en")

@app.post("/translate")
async def translate_text(data: dict):
    summary = data.get("summary")
    target_lang = data.get("target_lang")

    if not summary or not target_lang:
        return {"translation": "[⛔ Résumé ou langue cible manquants]"}

    try:
        if target_lang == "fr":
            result = translator_en_fr(summary)
        elif target_lang == "en":
            result = translator_fr_en(summary)
        else:
            return {"translation": "[⛔ Langue cible non supportée]"}
        return {"translation": result[0]["translation_text"]}
    except Exception as e:
        return {"translation": f"[❌ Erreur de traduction : {str(e)}]"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
