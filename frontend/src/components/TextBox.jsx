import { useState } from "react";
import PropTypes from "prop-types";
import "../styles/TextBox.css";

const TextBox = ({ onSendMessage, onSkip, skipLabel, disabled }) => {
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
};

TextBox.defaultProps = {
  onSkip: () => {},
  skipLabel: "Skip",
  disabled: false,
};

export default TextBox;
