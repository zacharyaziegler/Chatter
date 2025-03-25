import { useEffect, useState } from "react";
import Header from "../components/Header";
import Background from "../components/Background";
import ChatBox from "../components/ChatBox";
import MessageBoard from "../components/MessageBoard";
import TextBox from "../components/TextBox";
import "../styles/Chat.css";

const Chat = () => {
  const [socket, setSocket] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [remoteStream, setRemoteStream] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("Searching for a match...");
  const [roomId, setRoomId] = useState(null);


  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/chat");

    ws.onopen = () => {
        console.log("Connected to WebSocket server.");
        setStatus("Waiting for a match...");

        // Send user tags from localStorage
        const tags = JSON.parse(localStorage.getItem("tags")) || [];
        ws.send(`TAGS:${tags.join(",")}`);
    };

    ws.onmessage = (event) => {
        const data = event.data;

        if (data.startsWith("MATCHED:")) {
            const matchedRoomId = data.split(":")[1];
            setRoomId(matchedRoomId);
            setStatus("Matched! Start chatting.");
        } else if (data.startsWith("MSG:")) {
            setMessages((prev) => [...prev, { text: data.substring(4), isSent: false }]);
        }
    };

    ws.onclose = () => {
        console.log("Disconnected from WebSocket server.");
        setStatus("Disconnected.");
    };

    setSocket(ws);

    return () => {
        ws.close();
    };
}, []);

  // Handle sending a message
  const handleSendMessage = (newMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      if (!roomId) {
        console.error("No room ID assigned, can't send message.");
        return;
      }

      const formattedMessage = `MSG:${roomId}:${newMessage}`;
      socket.send(formattedMessage);
      setMessages((prevMessages) => [...prevMessages, { text: newMessage, isSent: true }]);
    }
  };
  return (
    <Background>
      <div className="chat__container">
        <Header />
        <ChatBox>
          <div className="chat_content">
            {/* Status Indicator */}
            <div className="chat_status">
              <p>{status}</p>
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
