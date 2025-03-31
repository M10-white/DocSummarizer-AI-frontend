from fastapi import FastAPI, UploadFile
from extractor import extract_text_from_pdf, extract_text_from_docx
from summarizer import summarize_text_full

app = FastAPI()

@app.post("/summarize")
async def summarize(file: UploadFile):
    contents = await file.read()
    file_path = f"files/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(contents)

    if file.filename.endswith(".pdf"):
        text = extract_text_from_pdf(file_path)
    elif file.filename.endswith(".docx"):
        text = extract_text_from_docx(file_path)
    else:
        return {"error": "Format non pris en charge"}

    summary = summarize_text_full(text)
    return {"summary": summary}
