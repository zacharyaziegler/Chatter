import "../styles/MessageBoard.css";
import PropTypes from "prop-types";

const MessageBoard = ({ messages }) => {
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
    </div>
  );
};

export default MessageBoard;

MessageBoard.propTypes = {
    messages: PropTypes.node.isRequired
};
