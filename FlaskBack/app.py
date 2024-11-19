from flask import Flask, request, jsonify
import requests
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import language_tool_python
from flask_cors import CORS
from transformers import BertTokenizer, BertModel
import torch
import torch.nn.functional as F
from cachetools import TTLCache

app = Flask(__name__)
CORS(app)

# Configuration de l'API Ollama
OLLAMA_API_URL = "http://localhost:11434/api/generate" 

# Initialisation des modèles BERT et SentenceTransformer au démarrage
tokenizer_bert = BertTokenizer.from_pretrained('distilbert-base-uncased')
model_bert = BertModel.from_pretrained('distilbert-base-uncased')
embedding_model = SentenceTransformer('paraphrase-albert-small-v2')
language_tool = language_tool_python.LanguageTool('fr')

# Cache pour stocker les réponses générées pour une période donnée (ex: 10 minutes)
cache = TTLCache(maxsize=100, ttl=600)

def generate_ideal_response(question):
    """Génère une réponse idéale pour une question, avec mise en cache."""
    if question in cache:
        return cache[question]
    
    prompt = f"Fournis une réponse courte, claire et concise à la question suivante : {question}"
    response = requests.post(
        OLLAMA_API_URL,
        json={"prompt": prompt, "model": "gemma:2b", "stream": False}
    )
    
    if response.status_code == 200:
        data = response.json()
        ideal_response = data.get('response', "").strip()
        cache[question] = ideal_response
        return ideal_response
    return None

def calculate_similarity(response_ideal, response_user):
    """Calcul de la similarité cosinus entre embeddings SentenceTransformer."""
    embeddings_ideal = embedding_model.encode([response_ideal])
    embeddings_user = embedding_model.encode([response_user])
    return cosine_similarity(embeddings_ideal, embeddings_user)[0][0]

def evaluate_clarity(response_user):
    """Évalue la clarté de la réponse utilisateur."""
    matches = language_tool.check(response_user)
    corrected_text = language_tool_python.utils.correct(response_user, matches)
    return 1.0 if corrected_text == response_user else 0.5

def calculate_cosine_similarity_bert(response_ideal, response_user):
    """Calcul de la similarité cosinus entre embeddings BERT."""
    inputs_ideal = tokenizer_bert(response_ideal, return_tensors="pt", padding=True, truncation=True)
    inputs_user = tokenizer_bert(response_user, return_tensors="pt", padding=True, truncation=True)
    
    with torch.no_grad():
        embeddings_ideal = model_bert(**inputs_ideal).last_hidden_state.mean(dim=1)
        embeddings_user = model_bert(**inputs_user).last_hidden_state.mean(dim=1)
    
    return F.cosine_similarity(embeddings_ideal, embeddings_user).item()

@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.get_json()
    question = data.get('question')
    response_user = data.get('response_user')

    if not question or not response_user:
        return jsonify({'error': 'Both question and user response are required'}), 400

    response_ideal = generate_ideal_response(question)
    if not response_ideal:
        return jsonify({'error': 'Unable to generate ideal response'}), 500

    relevance_score = calculate_similarity(response_ideal, response_user)
    clarity_score = evaluate_clarity(response_user)
    score_bert = calculate_cosine_similarity_bert(response_ideal, response_user)
    overall_score = (relevance_score + clarity_score + score_bert) / 3

    result = {
        "relevance_score": float(relevance_score),
        "clarity_score": float(clarity_score),
        "score_bert": float(score_bert),
        "overall_score": float(overall_score),
        "response_ideal": response_ideal
    }

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
