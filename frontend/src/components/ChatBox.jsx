import PropTypes from "prop-types";
import "../styles/ChatBox.css";

const ChatBox = ({ children }) => {
    return (
        <div className="chat-box">
            {children}
        </div>
    );
};

export default ChatBox;

ChatBox.propTypes = {
    children: PropTypes.node.isRequired, 
};
