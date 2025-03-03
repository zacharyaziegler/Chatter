import Header from "../components/Header";
import Background from "../components/Background"; 
import "../styles/Chat.css";

const Chat = () => {
  return (
    <Background>
      <div className="chat__container">
        <Header />
        <div className="chat-box">
          {/* Chat content will go here */}
        </div>
      </div>
    </Background>
  );
};

export default Chat;
