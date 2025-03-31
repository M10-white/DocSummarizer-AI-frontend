from transformers import pipeline
from langdetect import detect

# Préparer les deux modèles
summarizers = {
    'fr': pipeline("summarization", model="moussaKam/barthez-orangesum-abstract", tokenizer="moussaKam/barthez-orangesum-abstract"),
    'en': pipeline("summarization", model="google/pegasus-xsum", tokenizer="google/pegasus-xsum")
}

def detect_language(text):
    try:
        lang = detect(text)
        return lang if lang in summarizers else 'en'  # Par défaut anglais
    except:
        return 'en'

def summarize_chunk(text):
    input_length = len(text.split())
    max_len = min(200, int(input_length * 0.8))
    min_len = min(80, max(30, int(max_len * 0.5)))

    if min_len >= max_len:
        min_len = max_len - 5 if max_len > 5 else 5

    lang = detect_language(text)
    print(f"🌐 Langue détectée : {lang.upper()} → modèle appliqué")

    summarizer = summarizers[lang]

    summary = summarizer(
        text,
        max_length=max_len,
        min_length=min_len,
        do_sample=False,
        num_beams=4,
        early_stopping=True
    )
    return summary[0]['summary_text']
