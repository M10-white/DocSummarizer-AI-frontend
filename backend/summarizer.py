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
    words = text.split()
    if not words or len(words) < 5:
        return "[⛔ Chunk trop court pour être résumé]"

    input_length = len(words)
    max_len = min(200, int(input_length * 0.8))
    min_len = min(80, max(30, int(max_len * 0.5)))

    if min_len >= max_len:
        min_len = max_len - 5 if max_len > 5 else 5

    lang = detect_language(text)
    print(f"🌐 Langue détectée : {lang.upper()} → modèle appliqué")

    summarizer = summarizers[lang]

    print(f"🧾 Chunk ({len(text.split())} mots) : {text[:150]}...")
    summary = summarizer(
        text,
        max_length=max_len,
        min_length=min_len,
        do_sample=False,
        num_beams=4,
        early_stopping=True
    )
    return summary[0]['summary_text']

def summarize_text_full(text, chunk_size=1000):
    print("📄 Découpage du texte et résumé multi-blocs...")
    chunks = []
    words = text.split()
    for i in range(0, len(words), chunk_size):
        chunk = " ".join(words[i:i+chunk_size])
        chunks.append(chunk)

    summaries = []
    for i, chunk in enumerate(chunks):
        print(f"\n🧠 Résumé du bloc {i+1}/{len(chunks)}...")
        try:
            summary = summarize_chunk(chunk)
            summaries.append(summary)
        except Exception as e:
            print(f"⚠️ Erreur dans le résumé du bloc {i+1}: {e}")
            summaries.append("[Résumé indisponible pour ce bloc]")

    return "\n\n".join(summaries)

