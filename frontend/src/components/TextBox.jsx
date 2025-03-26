import { useState } from "react";
import PropTypes from "prop-types";
import "../styles/TextBox.css";

const TextBox = ({ onSendMessage, onSkip }) => {
  const [message, setMessage] = useState("");

  // Handles input change
  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  // Handles message submission
  const handleSendMessage = () => {
    if (message.trim() !== "") {
      onSendMessage(message); // Calls function passed from parent
      setMessage(""); // Clears input after sending
    }
  };

  // Example skip handler if you want to pass it up to the parent
  const handleSkip = () => {
    if (onSkip) {
      onSkip();
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
        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
      />
      <button className="send-button" onClick={handleSendMessage}>
        Send
      </button>
      <button className="skip-button" onClick={handleSkip}>
        Skip
      </button>
    </div>
  );
};

TextBox.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onSkip: PropTypes.func, // optional, if you want to handle skipping
  skipLabel: PropTypes.string,
};

TextBox.defaultProps = {
  onSkip: () => {},
  skipLabel: "Skip",
};

export default TextBox;
