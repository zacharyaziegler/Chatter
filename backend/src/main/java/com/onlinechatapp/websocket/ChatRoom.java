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

    public void broadcastMessage(String message, WebSocketSession sender) throws IOException {
        System.out.println("Broadcasting message: " + message);
    
        if (user1.isOpen() && !user1.equals(sender)) {
            System.out.println("Sending to user1: " + user1.getId());
            user1.sendMessage(new TextMessage("MSG:" + message));
        }
        if (user2.isOpen() && !user2.equals(sender)) {
            System.out.println("Sending to user2: " + user2.getId());
            user2.sendMessage(new TextMessage("MSG:" + message));
        }
    }
    

    public void relayRTCMessage(String rtcData, WebSocketSession sender) throws IOException {
        if (user1.isOpen() && !user1.equals(sender)) {
            user1.sendMessage(new TextMessage(rtcData));
        }
        if (user2.isOpen() && !user2.equals(sender)) {
            user2.sendMessage(new TextMessage(rtcData));
        }
    }

    public void notifyPartnerLeft(WebSocketSession leavingSession) throws IOException {
        // Identify the "partner" who did NOT leave
        WebSocketSession partner = leavingSession.equals(user1) ? user2 : user1;
    
        if (partner.isOpen()) {
            partner.sendMessage(new TextMessage("PARTNER_LEFT:" + id));
            System.out.println("Notified partner (" + partner.getId() + ") that user left room " + id);
        }
    }
    

    public boolean containsSession(WebSocketSession session) {
        return session.equals(user1) || session.equals(user2);
    }

    public String getId() {
        return this.id;
      }
}
