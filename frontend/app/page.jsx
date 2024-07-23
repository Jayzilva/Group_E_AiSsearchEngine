"use client";
import axios from "axios";
import { useState } from "react";

export default function ApiFetch() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    } else {
      setFile(null);
    }
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      console.error("No file selected");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("question", question);

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/ask_question",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setAnswer(response.data.answer);
    } catch (error) {
      console.error("Error processing PDF:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">
        PDF Question Answering
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          required
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
        <input
          type="text"
          value={question}
          onChange={handleQuestionChange}
          placeholder="Ask a question"
          required
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg p-2 bg-gray-50 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none"
        >
          Upload and Ask
        </button>
      </form>
      {loading && (
        <div className="flex justify-center items-center mt-4">
          <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-8 h-8 animate-spin"></div>
        </div>
      )}
      {answer && (
        <div className="mt-8 p-6 bg-gray-100 rounded-lg max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold text-gray-800">Answer:</h2>
          <p className="text-gray-700">{answer}</p>
        </div>
      )}
    </div>
  );
}
