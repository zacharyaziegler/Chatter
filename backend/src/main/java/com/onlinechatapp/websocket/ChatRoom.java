package com.onlinechatapp.websocket;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;

public class ChatRoom {
    private String id;
    private WebSocketSession user1;
    private WebSocketSession user2;

    public ChatRoom(String id, WebSocketSession user1, WebSocketSession user2) {
        this.id = id;
        this.user1 = user1;
        this.user2 = user2;
    }

    public void broadcastMessage(String message) throws IOException {
        if (user1.isOpen()) {
            user1.sendMessage(new TextMessage("MSG:" + message));
        }
        if (user2.isOpen()) {
            user2.sendMessage(new TextMessage("MSG:" + message));
        }
    }

    public boolean containsSession(WebSocketSession session) {
        return session.equals(user1) || session.equals(user2);
    }
}
