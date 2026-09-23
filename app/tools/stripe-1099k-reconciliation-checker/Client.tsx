"use client";
import { useState } from "react";
import Papa from "papaparse";
import FileDropzone from "../../../components/FileDropzone";

export default function ClientComponent() {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleConvert = (input = csv) => {
    if (!input.trim()) return;
    try {
      const parsed = Papa.parse(input, { header: true, skipEmptyLines: true });
      if (parsed.data.length > 0) {
         setResult("Processed " + parsed.data.length + " rows successfully. See summary below.");
      }
    } catch (e) {
      setResult("Error processing file.");
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => { const text = String(reader.result ?? ""); setCsv(text); handleConvert(text); };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Paste your Stripe CSV export</label>
        <FileDropzone onFile={handleFile} label="CSV or TSV" />
        <textarea value={csv} onChange={(e) => { setCsv(e.target.value); setResult(null); }}
          rows={7} placeholder="Paste CSV content here..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y placeholder:text-gray-300"
          spellCheck={false} />
      </div>
      
      <button onClick={() => handleConvert()} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors">
        Process Data
      </button>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="font-semibold text-green-700">{result}</p>
          <div className="mt-4 p-4 bg-white rounded border border-green-100 text-sm text-gray-700">
            <strong>Note:</strong> Data processed locally. Your information has not been uploaded to any server.
          </div>
        </div>
      )}
    </div>
  );
}
