import React, { useState, useEffect } from "react";
import axios from "axios";
import { Moon, Sun, FileText, UploadCloud, Loader, Download, Eye, RotateCcw } from "lucide-react";

function App() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setInitialLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const resetApp = () => {
    setFile(null);
    setSummary("");
    setPreview("");
    setErrorMessage("");
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
      if (typeof response.data?.summary === "string") {
        setSummary(response.data.summary.trim());
      } else {
        setSummary("");
        throw new Error("Résumé introuvable dans la réponse.");
      }
    } catch (error) {
      console.error("Erreur lors du résumé :", error);
      setErrorMessage("❌ Une erreur est survenue pendant le résumé. Veuillez vérifier que le backend fonctionne et que le fichier est valide.");
    }
    setLoading(false);
    setTimeout(() => setProgress(0), 500);
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
        <button onClick={() => setDarkMode(!darkMode)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {summary && (
          <button onClick={resetApp} className="absolute top-4 left-4 p-2 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition">
            <RotateCcw size={20} />
          </button>
        )}

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
              {loading ? <span className="flex items-center gap-2"><Loader className="animate-spin" size={18} /> Résumé en cours...</span> : "Générer le résumé"}
            </button>
          </>
        )}

        {loading && (
          <div className="mt-4 w-full max-w-md">
            <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">💡 L'IA travaille... Veuillez patienter.</p>
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
          <div className="mt-6 w-full max-w-2xl bg-white dark:bg-gray-700 p-6 rounded-xl shadow-xl animate-fade-in-up border border-slate-200 dark:border-gray-600">
            <h2 className="text-2xl font-semibold mb-3 flex items-center text-slate-800 dark:text-gray-100">
              <FileText className="mr-2" /> Résumé :
            </h2>
            <p className="whitespace-pre-line text-slate-700 dark:text-gray-300 leading-relaxed mb-4">{summary}</p>
            <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
              <Download size={18} /> Télécharger le résumé
            </button>
          </div>
        )}

        <style jsx>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes shake {
            0% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            50% { transform: translateX(5px); }
            75% { transform: translateX(-5px); }
            100% { transform: translateX(0); }
          }
          .animate-fade-in { animation: fade-in 0.6s ease-out forwards; }
          .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
          .animate-shake { animation: shake 0.4s ease-in-out; }
        `}</style>
      </div>
    </div>
  );
}

export default App;
