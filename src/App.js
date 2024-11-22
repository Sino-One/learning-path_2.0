// src/App.js
import React, { useEffect, useState } from "react";
import ChatWindow from "./components/ChatWindow";
import ConversationMenu from "./components/ConversationMenu";
import "./App.css";
import Header from "./components/Header";
import { Routes, Route } from "react-router-dom";
import CheckAnswer from "./components/CheckAnswer";

function App() {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);

  const handleSelectConversation = (id) => {
    setSelectedConversation(id);
  };

  const loadChats = async () => {
    const response = await fetch("http://localhost:3001/getChatsId");
    const data = await response.json();
    setConversations(data);
  };

  const newChat = async () => {
    setConversations([...conversations, { chatId: conversations.length + 1 }]);
    setSelectedConversation(conversations.length + 1);
  };

  useEffect(() => {
    loadChats();
  }, []);

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
                selectedConversation={selectedConversation}
                newChat={newChat}
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
