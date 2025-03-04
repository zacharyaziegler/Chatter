import Header from "../components/Header";
import Background from "../components/Background";
import ChatBox from "../components/ChatBox";
import WebcamView from "../components/WebCamView";
import "../styles/Chat.css";
import { useState } from "react";

const Chat = () => {
  // eslint-disable-next-line no-unused-vars
  const [remoteStream, setRemoteStream] = useState(null); 
  return (
    <Background>
      <div className="chat__container">
        <Header />
        <ChatBox>
          <div className="video_container">
            {/* Local Webcam */}
            <WebcamView isLocal={true} mirrored={true} />

            {/* Remote User's Webcam */}
            <WebcamView isLocal={false} videoStream={remoteStream} />
          </div>
        </ChatBox>
      </div>
    </Background>
  );
};

export default Chat;
