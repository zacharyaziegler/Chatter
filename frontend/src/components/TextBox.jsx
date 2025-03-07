import { useState } from "react";
import PropTypes from "prop-types";
import "../styles/TextBox.css";

const TextBox = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  // Handles input change
  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  // Handles message submission
  const handleSendMessage = () => {
    if (message.trim() !== "") {
      onSendMessage(message); // Calls function passed from Chat.jsx
      setMessage(""); // Clears input after sending
    }
  };

  return (
    <div className="text-box">
      <input
        type="text"
        className="text-input"
        placeholder="Type a message..."
        value={message}
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} // Sends on Enter key
      />
      <button className="send-button" onClick={handleSendMessage}>
        Send
      </button>
    </div>
  );
};

export default TextBox;

TextBox.propTypes = {
    onSendMessage: PropTypes.node.isRequired
}