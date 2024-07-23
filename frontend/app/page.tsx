"use client";
import axios from "axios";
import { ChangeEvent, useState } from "react";

export default function ApiFetch() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!file) {
      console.error("No file selected");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/summarize_pdf",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error summarizing PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">PDF Summarizer</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          required
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
        >
          Upload and Summarize
        </button>
      </form>
      {loading ? (
        <div className="flex justify-center items-center mt-4">
          <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
        </div>
      ) : (
        summary && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800">Summary:</h2>
            <p className="text-gray-700">{summary}</p>
          </div>
        )
      )}
    </div>
  );
}
