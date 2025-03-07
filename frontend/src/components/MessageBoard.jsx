import "../styles/MessageBoard.css";
import { useEffect, useRef } from "react";
import PropTypes from "prop-types";

const MessageBoard = ({ messages }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="message-board">
      {messages.length > 0 ? (
        messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isSent ? "sent" : "received"}`}>
            {msg.text}
          </div>
        ))
      ) : (
        <p className="no-messages">No messages yet...</p>
      )}
      {/* Invisible div to scroll into view */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageBoard;

MessageBoard.propTypes = {
    messages: PropTypes.node.isRequired
};
