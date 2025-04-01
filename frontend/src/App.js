import React, { useState, useEffect } from "react";
import axios from "axios";
import { Moon, Sun, FileText, UploadCloud, Loader, Download, Eye, FilePlus2, Languages } from "lucide-react";

function App() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [translated, setTranslated] = useState("");
  const [translationLang, setTranslationLang] = useState("");
  const [loading, setLoading] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("Analyse du contenu...");

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:8000/health");
        if (res.ok) {
          setInitialLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error("Le backend n'est pas encore prêt :", err);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const resetApp = () => {
    setFile(null);
    setSummary("");
    setTranslated("");
    setTranslationLang("");
    setErrorMessage("");
    setProgress(0);
    setPreview("");
    setLoadingMessage("Analyse du contenu...");
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setSummary("");
    setErrorMessage("");
    setPreview("");

    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      try {
        const response = await axios.post("http://localhost:8000/extract", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (typeof response.data?.text === "string") {
          setPreview(response.data.text.slice(0, 400)+"...");
        }
      } catch (err) {
        console.error("Erreur lors de l'extraction du texte :", err);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const fileBlob = new Blob([summary], { type: "text/plain" });
    element.href = URL.createObjectURL(fileBlob);
    element.download = "resume.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSummarize = async () => {
    if (!file) return;
    setLoading(true);
    setProgress(10);
    setLoadingMessage("📄 Lecture du fichier...");

    const messages = [
      "📄 Lecture du fichier...",
      "🤖 Pré-traitement du contenu...",
      "🧠 Résumé en cours de génération...",
      "🔍 Finalisation..."
    ];

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 1500);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://localhost:8000/summarize", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) {
            const percent = Math.round((e.loaded * 100) / e.total);
            setProgress(Math.min(percent, 95));
          }
        },
      });

      setProgress(100);
      clearInterval(messageInterval);
      if (typeof response.data?.summary === "string") {
        setSummary(response.data.summary.trim());
      } else {
        setSummary("");
        throw new Error("Résumé introuvable dans la réponse.");
      }
    } catch (error) {
      clearInterval(messageInterval);
      console.error("Erreur lors du résumé :", error);
      setErrorMessage("❌ Une erreur est survenue pendant le résumé. Veuillez réessayer.");
    }
    setLoading(false);
    setTimeout(() => setProgress(0), 500);
  };

  const handleTranslate = async () => {
    if (!summary || !translationLang) return;
    setTranslating(true);
    try {
      const res = await axios.post("http://localhost:8000/translate", {
        summary,
        target_lang: translationLang,
      });
      if (res.data?.translation) setTranslated(res.data.translation);
    } catch (err) {
      console.error("Erreur de traduction :", err);
    }
    setTranslating(false);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">Chargement de l'application...</p>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gradient-to-b from-white via-slate-100 to-slate-200 dark:from-gray-900 dark:to-gray-800 text-slate-800 dark:text-gray-200 flex flex-col items-center justify-center p-8 transition-all duration-300 ease-in-out" onDragEnter={handleDrag}>
        <div className="absolute top-4 left-4">
          {summary && (
            <button onClick={resetApp} className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">
              <FilePlus2 size={18} /> Nouvelle génération
            </button>
          )}
        </div>

        <button onClick={() => setDarkMode(!darkMode)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <h1 className="text-4xl font-extrabold mb-6 flex items-center gap-2">
          <FileText className="text-blue-700 dark:text-yellow-400" />
          DocSummarizer AI
        </h1>

        {!summary && (
          <>
            <div onDrop={handleDrop} onDragOver={handleDrag} onDragLeave={handleDrag} className={`mb-4 w-full max-w-md p-6 border-4 border-dashed rounded-xl cursor-pointer transition-colors duration-300 ${dragActive ? "border-blue-500 bg-blue-50 dark:bg-gray-700" : "border-gray-300 bg-white dark:bg-gray-800"}`}>
              <input type="file" accept=".pdf,.docx" onChange={handleFileChange} className="hidden" id="upload" />
              <label htmlFor="upload" className="flex flex-col items-center justify-center w-full h-full text-center text-gray-500 dark:text-gray-300 hover:text-blue-500">
                <UploadCloud className="mb-2" size={28} />
                Glissez-déposez un fichier ici ou <span className="underline">cliquez pour en choisir un</span>
              </label>
              {file && (
                <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 font-medium">📂 Fichier sélectionné : {file.name}</p>
              )}
            </div>

            {preview && (
              <div className="w-full max-w-2xl mb-6 p-4 bg-slate-50 dark:bg-gray-700 rounded shadow">
                <h3 className="flex items-center text-lg font-semibold mb-2">
                  <Eye className="mr-2" size={18} /> Aperçu du contenu extrait :
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line max-h-40 overflow-y-auto">{preview}</p>
              </div>
            )}

            <button onClick={handleSummarize} disabled={!file || loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300 ease-in-out disabled:opacity-50">
              {loading ? <span className="flex items-center gap-2"><Loader className="animate-spin" size={18} /> {loadingMessage}</span> : "Générer le résumé"}
            </button>
          </>
        )}

        {loading && (
          <div className="mt-4 w-full max-w-md">
            <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">💡 {loadingMessage}</p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 text-red-600 font-medium animate-shake">
            {errorMessage}
          </div>
        )}

        {summary && (
          <div className={`mt-6 w-full max-w-6xl ${translated || translating ? "flex flex-col md:flex-row gap-6" : "flex justify-center"}`}>
            <div className="w-full md:w-1/2 bg-white dark:bg-gray-700 p-6 rounded-xl shadow-xl border border-slate-200 dark:border-gray-600 animate-fade-in-up">
              <h2 className="text-2xl font-semibold mb-3 flex items-center text-slate-800 dark:text-gray-100">
                <FileText className="mr-2" /> Résumé :
              </h2>
              <p className="whitespace-pre-line text-slate-700 dark:text-gray-300 leading-relaxed mb-4">{summary}</p>
              <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition mb-4">
                <Download size={18} /> Télécharger le résumé
              </button>
              <div className="flex items-center gap-2">
                <Languages size={18} />
                <select onChange={(e) => setTranslationLang(e.target.value)} value={translationLang} className="px-2 py-1 border rounded">
                  <option value="">Traduire en...</option>
                  <option value="fr">Français 🇫🇷</option>
                  <option value="en">Anglais 🇬🇧</option>
                </select>
                <button onClick={handleTranslate} className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700">Traduire</button>
              </div>
            </div>

            {(translated || translating) && (
              <div className="w-full md:w-1/2 bg-white dark:bg-gray-700 p-6 rounded-xl shadow-xl border border-slate-200 dark:border-gray-600 animate-fade-in-up">
                <h3 className="text-xl font-semibold mb-2">🌍 Traduction :</h3>
                {translating ? (
                  <p className="text-blue-500 animate-pulse flex items-center gap-2">
                    <Loader className="animate-spin" size={18} /> Traduction en cours...
                  </p>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{translated || "Aucune traduction encore."}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
