import { useState } from "react";
import PropTypes from "prop-types";
import "../styles/TextBox.css";

const TextBox = ({ onSendMessage, onSkip, skipLabel, disabled, onTyping }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Handles input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (value.length > 0 && !isTyping) {
      onTyping(true);
      setIsTyping(true);
    } else if (value.length === 0 && isTyping) {
      onTyping(false);
      setIsTyping(false);
    }
  };

  // Handles message submission
  const handleSendMessage = () => {
    if (message.trim() !== "") {
      onSendMessage(message); // Calls function passed from parent
      setMessage(""); // Clears input after sending
      if (isTyping) {
        onTyping(false);
        setIsTyping(false);
      }
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
        placeholder={disabled ? "Waiting for a match..." : "Type a message..."}
        value={message}
        onChange={handleInputChange}
        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        disabled = {disabled}
      />
      <button className="send-button" onClick={handleSendMessage}>
        Send
      </button>
      <button className="skip-button" onClick={handleSkip}>
        {skipLabel}
      </button>
    </div>
  );
};

TextBox.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
  onSkip: PropTypes.func, 
  skipLabel: PropTypes.string,
  disabled: PropTypes.bool,
  onTyping: PropTypes.func,
};

TextBox.defaultProps = {
  onSkip: () => {},
  skipLabel: "Skip",
  disabled: false,
  onTyping: () => {},
};

export default TextBox;
