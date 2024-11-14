// src/App.js
import React, { useState } from "react";
import ChatWindow from "./components/ChatWindow";
import ConversationMenu from "./components/ConversationMenu";
import "./App.css";
import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import CheckAnswer from "./components/CheckAnswer";

function App() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([
    { id: 1, title: "Conversation 1" },
    { id: 2, title: "Conversation 2" },
    { id: 3, title: "Conversation 3" },
  ]);

  const handleSelectConversation = (id) => {
    setSelectedConversation(id);
  };

  return (
    <>
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <div className="app-container">
              <ConversationMenu
                conversations={conversations}
                onSelectConversation={handleSelectConversation}
              />
              <ChatWindow conversationId={selectedConversation} />
            </div>
          }
        />
        <Route path="/check-answer" element={<CheckAnswer />} />
      </Routes>
    </>
  );
}

export default App;
