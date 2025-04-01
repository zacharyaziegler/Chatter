import { useEffect, useState, useRef } from "react";
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
  const roomIdRef = useRef(roomId);
  const [hasSkipped, setHasSkipped] = useState(false);
  const skipLabel = roomId ? "Skip" : "Find new match";
  const inputDisabled = !roomId;

  useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080/chat");

    ws.onopen = () => {
      console.log("Connected to WebSocket server.");
      setStatus("Waiting for a match...");

      // Send user tags from localStorage
      const tags = JSON.parse(localStorage.getItem("tags")) || [];
      console.log("TAGS: ", tags);
      ws.send(`TAGS:${tags.join(",")}`);
    };

    ws.onmessage = (event) => {
      const data = event.data;

      if (data.startsWith("MATCHED:")) {
        setMessages([]);
        const parts = data.split(":");
        const matchedRoomId = parts[1];
        setRoomId(matchedRoomId);
        if (parts.length > 2) {
          const commonTags = parts[2].trim(); // This is either a comma-separated list or "random"
          console.log(commonTags);
          if (commonTags === "no common match") {
            setStatus("Matched! No one with your tags was available—connecting you with a random user.");          
          } else if (!commonTags || commonTags === "random"){
            setStatus(`Matched with a random user!`);
          } else {
            setStatus(`Matched! Common Tags: ${commonTags}`);
          }
        } else {
          setStatus("Matched with a random user!");
        }
      } else if (data.startsWith("MSG:")) {
        setMessages((prev) => [
          ...prev,
          { text: data.substring(4), isSent: false },
        ]);
      } else if (data.startsWith("PARTNER_LEFT:")) {
        console.log("Received PARTNER_LEFT message:", data);
        // The other user left the match
        const partedRoom = data.split(":")[1];
        if (partedRoom === roomIdRef.current) {
          console.log("Parted room if entered");
          setRoomId(null);
          setStatus("Your partner left the match. Click 'Find new match'.");
          setHasSkipped(true);
        }
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
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: newMessage, isSent: true },
      ]);
    }
  };

  // Handle skip logic
  const handleSkip = () => {
    if (roomId && !hasSkipped) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(`LEAVE:${roomId}`);
      }
      // "Disconnect" from the current match
      setRoomId(null);
      setStatus("You left the match. Click 'Find new match' to reconnect.");
      setHasSkipped(true);
    } else {
      // Request new match, maintain old chat until new match is found
      setStatus("Waiting for a match...");
      setHasSkipped(false);

      // Re-send tags to find new match (if socket is open)
      if (socket && socket.readyState === WebSocket.OPEN) {
        const tags = JSON.parse(localStorage.getItem("tags")) || [];
        socket.send(`TAGS:${tags.join(",")}`);
      }
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
              <TextBox
                onSendMessage={handleSendMessage}
                onSkip={handleSkip}
                skipLabel={skipLabel}
                disabled={inputDisabled}
              />
            </div>
          </div>
        </ChatBox>
      </div>
    </Background>
  );
};

export default Chat;
