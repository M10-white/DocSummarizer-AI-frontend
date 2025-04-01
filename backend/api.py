from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
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
    path = f"files/{file.filename}"

    with open(path, "wb") as f:
        f.write(contents)

    if file.filename.endswith(".pdf"):
        text = extract_text_from_pdf(path)
    elif file.filename.endswith(".docx"):
        text = extract_text_from_docx(path)
    else:
        return {"summary": "❌ Format non pris en charge."}

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
