import Header from "../components/Header";
import Background from "../components/Background";
import ChatBox from "../components/ChatBox";
import WebcamView from "../components/WebCamView";
import MessageBoard from "../components/MessageBoard";
import TextBox from "../components/TextBox";
import "../styles/Chat.css";
import { useState } from "react";

const Chat = () => {
  // eslint-disable-next-line no-unused-vars
  const [remoteStream, setRemoteStream] = useState(null); 
  const [messages, setMessages] = useState([
    {text: "Hey!", isSent: true},
    {text: "Hi there!", isSent: false}
  ])

  const handleSendMessage = (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, { text: newMessage, isSent: true }]);
  };

  return (
    <Background>
      <div className="chat__container">
        <Header />
        <ChatBox>
          <div className="chat_content">
            {/* Left: Webcams */}
            <div className="video_container">
              <WebcamView isLocal={true} mirrored={true} />
              <WebcamView isLocal={false} videoStream={remoteStream} />
            </div>

            {/* Right: Message Board + Text Input */}
            <div className="chat_interface">
              <MessageBoard messages={messages} />
              <TextBox onSendMessage={handleSendMessage} />
            </div>
          </div>
        </ChatBox>
      </div>
    </Background>
  );
};

export default Chat;