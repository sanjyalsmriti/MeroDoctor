// ChatComponent.jsx
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";

const ChatComponent = ({ currentUser, doctorId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect to socket
    socketRef.current = io("http://localhost:5000");

    // Join user's room
    socketRef.current.emit("join", currentUser._id);

    // Listen for messages
    socketRef.current.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Load chat history
    loadChatHistory();

    return () => socketRef.current.disconnect();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(
        `/api/chat/messages/${currentUser._id}/${doctorId}`
      );
      setMessages(response.data);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      socketRef.current.emit("sendMessage", {
        sender: currentUser._id,
        receiver: doctorId,
        message: newMessage,
      });
      setNewMessage("");
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.sender === currentUser._id ? "sent" : "received"
            }`}
          >
            <p>{msg.message}</p>
            <span className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatComponent;
