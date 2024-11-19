import React, { useState } from "react";
import "./CheckAnswer.css";

function CheckAnswer() {
  const [question, setQuestion] = useState("Qu'est ce que la photosynthèse ?");
  const [responseUser, setResponseUser] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async () => {
    setLoading(true);
    setProgress(0);

    // Simulate progress increment while waiting for the response
    const interval = setInterval(() => {
      setProgress((prevProgress) => Math.min(prevProgress + 10, 90));
    }, 2000);

    try {
      const response = await fetch("http://localhost:5000/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: question,
          response_user: responseUser,
        }),
      });

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Erreur lors de l'évaluation:", error);
    } finally {
      clearInterval(interval);
      setProgress(100); // Set progress to 100% when done
      setTimeout(() => {
        setLoading(false);
        setProgress(0); // Reset progress bar for future submissions
      }, 500);
    }
  };

  return (
    <div className="check-answer-container">
      <h1 className="title">Évaluez votre réponse</h1>
      <div className="input-group">
        <label>
          Question :
          <input
            className="input-field"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </label>
      </div>
      <div className="input-group">
        <label>
          Votre réponse :
          <textarea
            className="textarea-field"
            value={responseUser}
            onChange={(e) => setResponseUser(e.target.value)}
          />
        </label>
      </div>
      <button className="submit-button" onClick={handleSubmit}>
        Évaluer
      </button>

      {loading && (
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}

      {results && (
        <div className="results-container">
          <h2>Résultats</h2>
          <p>
            <strong>Score de pertinence sklearn:</strong>{" "}
            {results.relevance_score}
          </p>
          <p>
            <strong>Score de pertinence bert:</strong> {results.score_bert}
          </p>
          <p>
            <strong>Score de clarté:</strong> {results.clarity_score}
          </p>
          <p>
            <strong>Score rouge-n:</strong> {results.rouge_n_score}
          </p>
          <p>
            <strong>Score global:</strong> {results.overall_score}
          </p>
          <p>
            <strong>Réponse:</strong> {results.response_ideal}
          </p>
        </div>
      )}
    </div>
  );
}

export default CheckAnswer;
