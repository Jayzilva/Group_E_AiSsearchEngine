from flask import Flask, request, jsonify
import PyPDF2
import openai
import os
from flask_cors import CORS
from dotenv import load_dotenv
import tiktoken
import tempfile

load_dotenv()

app = Flask(__name__)
CORS(app)

openai.api_key = os.getenv("OPENAI_API_KEY")
tokenizer = tiktoken.get_encoding("gpt2")

def read_pdf(file_path):
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page_num in range(len(reader.pages)):
            page = reader.pages[page_num]
            text += page.extract_text()
    return text

def chunk_text(text, max_chunk_size_tokens):
    tokens = tokenizer.encode(text)
    chunks = []
    while len(tokens) > max_chunk_size_tokens:
        chunk = tokenizer.decode(tokens[:max_chunk_size_tokens])
        chunks.append(chunk)
        tokens = tokens[max_chunk_size_tokens:]
    chunks.append(tokenizer.decode(tokens))
    return chunks

def ask_question_on_text(text, question):
    response = openai.Completion.create(
        engine="gpt-3.5-turbo-instruct",
        prompt=f"Text: {text}\n\nQuestion: {question}\nAnswer:",
        max_tokens=150
    )
    return response.choices[0].text.strip()

def process_large_text_with_question(text, question):
    max_tokens = 4097 - 150
    max_chunk_size_tokens = max_tokens - 50
    
    chunks = chunk_text(text, max_chunk_size_tokens)
    
    answers = []
    for chunk in chunks:
        answer = ask_question_on_text(chunk, question)
        answers.append(answer)
    
    combined_answer = " ".join(answers)
    return combined_answer

@app.route('/ask_question', methods=['POST'])
def ask_question():
    if 'file' not in request.files or 'question' not in request.form:
        return jsonify({"error": "File and question are required"}), 400

    file = request.files['file']
    question = request.form['question']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            file_path = temp_file.name
            file.save(file_path)
            
            text = read_pdf(file_path)
            answer = process_large_text_with_question(text, question)
            
        os.remove(file_path)
        
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
