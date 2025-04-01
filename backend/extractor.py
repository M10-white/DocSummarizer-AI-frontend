import pdfplumber
import docx
from io import BytesIO

def extract_text_from_pdf(file_bytes):
    with pdfplumber.open(BytesIO(file_bytes)) as pdf:
        text = ''
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + '\n'
    return text

def extract_text_from_docx(file_bytes):
    doc = docx.Document(BytesIO(file_bytes))
    return '\n'.join([para.text for para in doc.paragraphs])
