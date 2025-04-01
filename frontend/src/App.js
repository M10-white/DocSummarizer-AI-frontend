import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setSummary("");
    setErrorMessage("");
  };

  const handleSummarize = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await axios.post("http://localhost:8000/summarize", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      console.log("📦 Résultat API :", response.data);
  
      // Correction ici
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
  };  

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">📄 DocSummarizer AI</h1>

      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileChange}
        className="mb-4"
      />

      <button
        onClick={handleSummarize}
        disabled={!file || loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Résumé en cours..." : "Générer le résumé"}
      </button>

      {errorMessage && (
        <div className="mt-4 text-red-600 font-medium">
          {errorMessage}
        </div>
      )}

      {summary && (
        <div className="mt-6 w-full max-w-2xl bg-white p-4 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">📝 Résumé :</h2>
          <p className="whitespace-pre-line text-gray-800">{summary}</p>
        </div>
      )}
    </div>
  );
}

export default App;
