import React, { useEffect, useState } from "react";
import "./ChatWindow.css";

function ChatWindow({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [contextHistory, setContextHistory] = useState([]); // Initialise l'historique de contexte
  const [contextFields, setContextFields] = useState({
    niveau_etudiant: "",
    concept_actuel: "",
    objectif_apprentissage: "",
  });

  // Pré-prompts prédéfinis
  // test 1 : donne étape, méthodes et fonctions, assez précis mais donne les réponses apres
  // test 2 très procédurales, pas de code, pas d'exemple, tres verbeux mais intérréssant
  // test 3 : resultats tres différent, intérréssant

  const predefinedPrompts = [
    {
      // KO
      name: "test1",
      prompt:
        "Tu es un développeur senior et utilises toutes les bonnes pratiques pour coder. Tu ne donnes jamais directement la solution (pas d'exemple de code), tu guide la personne à la trouver elle-même par l'explication du processus et des indices techniques. Tu peux donne les étapes à réaliser afin de résoudre son problème par exemple. Tu ne donnes en aucun cas la solution directe, mais tu peux donner des indices techniques pour aider la personne à trouver la solution.",
    },
    {
      // KO
      name: "test2",
      prompt:
        "Tu agis comme guide pour un étudiant en développement web.Ton rôle est de l'orienter vers des solutions techniques, en lui donnant des indices et des étapes pour progresser dans la résolution de son problème. Assure-toi de ne jamais lui donner directement du code tout fait. Tu ne donnes pas la solution, ou pas d'exemple de code. Ton objectif est de l'aider à comprendre comment aborder et résoudre son problème par lui-même, en lui fournissant des conseils et des explications détaillées.",
    },
    {
      // KO
      name: "test3",
      prompt:
        "Tu es un développeur senior et tu aides un junior à résoudre un problème technique. Tu ne donnes pas la solution directe, mais tu l'orientes en lui donnant des indices et des explications techniques pour l'aider à trouver la solution par lui-même. Tu peux lui donner des étapes à suivre pour résoudre son problème, mais tu ne donnes pas d'exemple de code. Ton objectif est de l'aider à comprendre comment résoudre son problème par lui-même, en lui fournissant des conseils et des explications détaillées.",
    },
    {
      name: "test4",
      prompt:
        "Vous êtes un assistant éducatif spécialisé dans la programmation. Votre rôle est de fournir des réponses pédagogiques aux questions posées par les utilisateurs.  Pour chaque question, suivez les étapes suivantes, sans les citer :  - Identifiez le langage de programmation ou le sujet mentionné dans la question.  - Déterminez l'objectif de l'utilisateur.  - Divisez la solution en plusieurs étapes logiques sans donner de solutions (pas d'exemple de code)  - Chaque étape doit être expliquée clairement et simplement, avec des justifications si nécessaire. - Donnez des conseils pratiques pour éviter les erreurs courantes. - Mentionnez les sources de confusion possibles et comment les résoudre.  - Encouragez les tests et la vérification du code.  -Prevenir des cas d'erreurs possibles ou de potentiels améliorations à apporter - Suggérez des pratiques de codage efficaces et des ressources supplémentaires si pertinent.  Tu ne dois en aucun cas donner des exemples de code ou donner du code de référence qui donnerait la solution complète au problème.",
    },
    // { name: "test1", prompt: "Rédige un résumé clair et concis." },
    // {
    //   name: "Analyse critique",
    //   prompt: "Fais une analyse critique détaillée.",
    // },
    // {
    //   name: "Code assistant",
    //   prompt: "Fournis une aide au développement de code en PHP.",
    // },
  ];

  const generateDynamicContext = () => {
    const { niveau_etudiant, concept_actuel, objectif_apprentissage } =
      contextFields;
    return `
[Contexte pédagogique]
Niveau: ${niveau_etudiant || "Non spécifié"}
Concept: ${concept_actuel || "Non spécifié"}
Objectif: ${objectif_apprentissage || "Non spécifié"}

[Instructions]
1. Guider l'étudiant par des questions
2. Demander des explications
3. Fournir des indices si nécessaire
4. Valoriser le processus de réflexion
`;
  };

  const handleContextFieldChange = (field, value) => {
    setContextFields({ ...contextFields, [field]: value });
    const newContext = generateDynamicContext();
    setSelectedPrompt(newContext); // Met à jour le pré-prompt sélectionné
  };

  // Fonction pour transformer le texte en HTML avec mise en forme de code
  const formatTextToHtml = (text) => {
    let formattedText = text.replace(
      /```([\s\S]*?)```/g,
      "<pre><code>$1</code></pre>"
    );
    formattedText = formattedText.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );
    formattedText = formattedText.replace(/\*(.*?)\*/g, "<em>$1</em>");
    formattedText = formattedText.replace(/\n\* (.*?)(?=\n|$)/g, "<li>$1</li>");
    formattedText = formattedText.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");
    formattedText = formattedText.replace(/\n/g, "<br>");
    return formattedText;
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
      date: new Date().toISOString(),
      chatId: conversationId || "42", // Utilisez un chatId généré ou défini
    };

    // Ajouter le message utilisateur localement
    setMessages([...messages, userMessage]);
    setInput("");
    setIsLoading(true);

    // Enregistrer le message utilisateur dans la base
    await fetch("http://localhost:3001/sendChat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId: userMessage.chatId,
        role: userMessage.role,
        content: userMessage.content,
        date: userMessage.date,
      }),
    });

    // Préparer le message du bot
    let botMessage = {
      role: "bot",
      content: "",
      chatId: userMessage.chatId,
      date: "",
    };

    try {
      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gemma:2b",
          system: selectedPrompt || customPrompt,
          context: contextHistory,
          prompt: input,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        accumulatedContent += decoder.decode(value, { stream: true });
        const lines = accumulatedContent.split("\n");
        accumulatedContent = lines.pop(); // Stocke la dernière ligne incomplète

        for (let line of lines) {
          if (line.trim()) {
            try {
              const parsedData = JSON.parse(line);

              if (parsedData.response) {
                // Ajoute la réponse du bot progressivement
                botMessage.content += parsedData.response;
                botMessage.date = new Date().toISOString();
                setMessages((prevMessages) => [
                  ...prevMessages.filter((msg) => msg.role !== "bot"),
                  { ...botMessage }, // Affiche la réponse en cours
                ]);
              }

              if (parsedData.context) {
                setContextHistory(parsedData.context);
              }

              if (parsedData.done) {
                // Enregistrement final de la réponse complète du bot
                await fetch("http://localhost:3001/sendChat", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    chatId: botMessage.chatId,
                    role: botMessage.role,
                    content: botMessage.content,
                    date: botMessage.date,
                  }),
                });

                setIsLoading(false);
                return;
              }
            } catch (error) {
              console.error("Erreur de parsing JSON :", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message :", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadMessages = async () => {
      const response = await fetch(
        `http://localhost:3001/getChat/${conversationId}`
      );
      const data = await response.json();
      setMessages(data);
    };

    if (conversationId) {
      loadMessages();
    }
  }, [conversationId]);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="chat-window">
      <div className="prompt-selector">
        <select
          onChange={(e) => setSelectedPrompt(e.target.value)}
          value={selectedPrompt}
        >
          <option value="">Choisir un pré-prompt</option>
          {predefinedPrompts.map((prompt, index) => (
            <option key={index} value={prompt.prompt}>
              {prompt.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Ou saisissez un pré-prompt personnalisé"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
        />
      </div>
      <div className="dynamic-context">
        <h4>Personnaliser le contexte :</h4>
        <div className="context-fields">
          <input
            type="text"
            placeholder="Niveau étudiant"
            value={contextFields.niveau_etudiant}
            onChange={(e) =>
              handleContextFieldChange("niveau_etudiant", e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Concept actuel"
            value={contextFields.concept_actuel}
            onChange={(e) =>
              handleContextFieldChange("concept_actuel", e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Objectif d'apprentissage"
            value={contextFields.objectif_apprentissage}
            onChange={(e) =>
              handleContextFieldChange("objectif_apprentissage", e.target.value)
            }
          />
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role}`}
            dangerouslySetInnerHTML={{ __html: formatTextToHtml(msg.content) }}
          ></div>
        ))}
        {isLoading && (
          <div className="loader">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tapez un message..."
        />
        <button onClick={sendMessage} disabled={isLoading}>
          {(isLoading && (
            <div className="loader">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )) ||
            "Envoyer"}
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;
