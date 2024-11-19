// src/components/ConversationMenu.js
import React from "react";
import "./ConversationMenu.css";

function ConversationMenu({ conversations, onSelectConversation }) {
  return (
    <div className="conversation-menu">
      <h2>Conversations</h2>
      <ul>
        {conversations.map((conv) => (
          <li
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className="conversation-item"
          >
            {conv.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConversationMenu;
