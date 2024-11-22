// src/components/ConversationMenu.js
import React from "react";
import "./ConversationMenu.css";

function ConversationMenu({
  conversations,
  onSelectConversation,
  newChat,
  selectedConversation,
}) {
  return (
    <div className="conversation-menu">
      <h2>Conversations</h2>
      <button onClick={newChat}>New Chat</button>
      <ul>
        {[...conversations].reverse().map((conv) => (
          <li
            key={conv.chatId}
            onClick={() => onSelectConversation(conv.chatId)}
            className="conversation-item"
            style={
              selectedConversation == conv.chatId
                ? { backgroundColor: "grey" }
                : {}
            }
          >
            {conv.chatId}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ConversationMenu;
