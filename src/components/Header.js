// src/components/Header.js
import React from "react";
import "./Header.css";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const goTo = (path) => () => {
    navigate(path);
  };

  return (
    <header className="app-header">
      <h1>Learning Path</h1>
      <button className="add-conversation-btn" onClick={goTo("/")}>
        Accueil
      </button>
      <button className="add-conversation-btn" onClick={goTo("/check-answer")}>
        Question
      </button>
    </header>
  );
}

export default Header;
