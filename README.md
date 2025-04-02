# 📄 DocSummarizer AI

**DocSummarizer-AI** est une application web utilisant l'intelligence artificielle pour extraire, résumer et traduire automatiquement le contenu de documents PDF ou DOCX.

---

## 🚀 Fonctionnalités

- 🔍 **Extraction** de texte depuis des fichiers `.pdf` et `.docx`
- ✂️ **Résumé intelligent** via modèle Pegasus (transformers)
- 🌍 **Traduction automatique** (anglais ↔ français)
- 🎨 **Interface utilisateur** moderne et responsive avec React
- 🌙 **Mode sombre** activable

---

## 🧠 Tech Stack

| Frontend        | Backend        | IA / NLP            |
|-----------------|----------------|---------------------|
| React + Tailwind| FastAPI        | Transformers (HuggingFace) |
| Axios           | Uvicorn        | Pegasus, MarianMT   |

---

## 📦 Installation locale

```bash
# Cloner le repo
git clone https://github.com/ton-utilisateur/docsummarizer-ai.git
cd docsummarizer-ai

# Lancer le backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
uvicorn api:app --reload

# Lancer le frontend
cd ../frontend
npm install
npm start
```

---

## 🛠️ Structure du projet

```
docsummarizer-ai/
├── backend/
│   ├── api.py
│   ├── summarizer.py
│   ├── extractor.py
│   └── ...
├── frontend/
│   ├── public/
│   ├── src/
│   │   └── App.js
│   └── ...
└── README.md
```

---

## 📄 Licence

Ce projet est sous licence MIT.

---

## 🤝 Contribuer

Les contributions sont bienvenues !  
Fork le projet, crée une branche, envoie un PR 💡

---

## ✨ Remerciements

- [HuggingFace 🤗](https://huggingface.co/)
- [TailwindCSS](https://tailwindcss.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
