package com.onlinechatapp.websocket;

import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;

public class ChatHandler extends TextWebSocketHandler {

    private static final List<UserSession> waitingUsers = new ArrayList<>();
    private static final Map<String, ChatRoom> activeChats = new HashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        System.out.println("User connected: " + session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();
        System.out.println("Received: " + payload);
    
        try {
            if (payload.startsWith("TAGS:")) {
                String[] tags = payload.substring(5).split(",");
                handleUserConnection(session, tags);
            } else if (payload.startsWith("MSG:")) {
                // Safely split message into parts
                String[] parts = payload.split(":", 3);
    
                if (parts.length < 3) {
                    System.out.println("Invalid message format: " + payload);
                    return; // Ignore bad message instead of crashing
                }
    
                String chatRoomId = parts[1]; // Extract room ID
                String chatMessage = parts[2]; // Extract actual message
    
                sendMessageToRoom(chatRoomId, chatMessage, session);
            }
        } catch (Exception e) {
            System.err.println("Error handling message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void handleUserConnection(WebSocketSession session, String[] tags) throws IOException {
        synchronized (waitingUsers) {
            Optional<UserSession> match = waitingUsers.stream()
                    .filter(user -> user.matchesTags(tags))
                    .findFirst();

            if (match.isPresent()) {
                UserSession matchedUser = match.get();
                waitingUsers.remove(matchedUser);

                String chatRoomId = UUID.randomUUID().toString();
                ChatRoom chatRoom = new ChatRoom(chatRoomId, session, matchedUser.getSession());

                activeChats.put(chatRoomId, chatRoom);

                session.sendMessage(new TextMessage("MATCHED:" + chatRoomId));
                matchedUser.getSession().sendMessage(new TextMessage("MATCHED:" + chatRoomId));

                System.out.println("Matched " + session.getId() + " with " + matchedUser.getSession().getId());
            } else {
                waitingUsers.add(new UserSession(session, tags));
                session.sendMessage(new TextMessage("WAITING"));
            }
        }
    }

    private void sendMessageToRoom(String chatRoomId, String message, WebSocketSession senderSession) throws IOException {
        ChatRoom room = activeChats.get(chatRoomId);
    
        if (room == null) {
            System.out.println("No chat room found for ID: " + chatRoomId);
            return;
        }
    
        // Send message to the other user ONLY
        room.broadcastMessage(message, senderSession);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        System.out.println("User disconnected: " + session.getId());
        waitingUsers.removeIf(user -> user.getSession().equals(session));
        activeChats.values().removeIf(room -> room.containsSession(session));
    }
}
