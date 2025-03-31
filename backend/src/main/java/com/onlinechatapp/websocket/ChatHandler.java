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
                String[] parts = payload.split(":", 3);
                if (parts.length < 3) {
                    System.out.println("Invalid message format: " + payload);
                    return;
                }
                String chatRoomId = parts[1];
                String chatMessage = parts[2];
                sendMessageToRoom(chatRoomId, chatMessage, session);
            } else if (payload.startsWith("LEAVE:")) {
                String[] parts = payload.split(":", 2);
                if (parts.length < 2)
                    return;

                String chatRoomId = parts[1];
                handleLeave(session, chatRoomId);
            } else if (payload.startsWith("RTC_OFFER:") || payload.startsWith("RTC_ANSWER:")
                    || payload.startsWith("ICE_CANDIDATE:")) {
                String[] parts = payload.split(":", 3);
                if (parts.length < 3)
                    return;

                String chatRoomId = parts[1];
                String rtcData = parts[2];

                relayWebRTCMessage(chatRoomId, rtcData, session);
            }
        } catch (Exception e) {
            System.err.println("Error handling message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void handleLeave(WebSocketSession leavingSession, String chatRoomId) throws IOException {
        ChatRoom room = activeChats.get(chatRoomId);
        if (room == null)
            return;

        // If the user is in that room, remove it from activeChats
        if (room.containsSession(leavingSession)) {
            // Notify the other user
            room.notifyPartnerLeft(leavingSession);

            // Remove the room from activeChats
            activeChats.remove(chatRoomId);
            System.out.println("Room " + chatRoomId + " removed because user left.");
        }
    }

    private void relayWebRTCMessage(String chatRoomId, String rtcData, WebSocketSession senderSession)
            throws IOException {
        ChatRoom room = activeChats.get(chatRoomId);

        if (room == null)
            return;

        room.relayRTCMessage(rtcData, senderSession);
    }

    private void handleUserConnection(WebSocketSession session, String[] tags) throws IOException {
        synchronized (waitingUsers) {
            // First, try to find a waiting user (other than yourself) with at least one common tag.
            Optional<UserSession> match = waitingUsers.stream()
                    .filter(user -> !user.getSession().getId().equals(session.getId()))
                    .filter(user -> user.matchesTags(tags))
                    .findFirst();
    
            // If no common-tag match is found, then look for any available user.
            if (!match.isPresent()) {
                match = waitingUsers.stream()
                        .filter(user -> !user.getSession().getId().equals(session.getId()))
                        .findAny();
            }
    
            if (match.isPresent()) {
                UserSession matchedUser = match.get();
                waitingUsers.remove(matchedUser);
    
                String chatRoomId = UUID.randomUUID().toString();
                ChatRoom chatRoom = new ChatRoom(chatRoomId, session, matchedUser.getSession());
                activeChats.put(chatRoomId, chatRoom);
    
                // Compute intersection of tags
                List<String> userTags = Arrays.asList(tags);
                List<String> waitingUserTags = matchedUser.getTags();
                // Create a copy for intersection
                Set<String> commonTags = new HashSet<>(userTags);
                commonTags.retainAll(waitingUserTags);
    
                // Build the tag string. If none found, mark as "random".
                String tagInfo = commonTags.isEmpty() ? "random" : String.join(",", commonTags);
    
                // Send MATCHED message with chatRoomId and tag info
                String message = "MATCHED:" + chatRoomId + ":" + tagInfo;
                session.sendMessage(new TextMessage(message));
                matchedUser.getSession().sendMessage(new TextMessage(message));
    
                System.out.println("Matched " + session.getId() + " with " + 
                                   matchedUser.getSession().getId() + " (common tags: " + tagInfo + ")");
            } else {
                waitingUsers.removeIf(user -> user.getSession().getId().equals(session.getId()));
                waitingUsers.add(new UserSession(session, tags));
                session.sendMessage(new TextMessage("WAITING"));
            }
        }
    }

    private void sendMessageToRoom(String chatRoomId, String message, WebSocketSession senderSession)
            throws IOException {
        ChatRoom room = activeChats.get(chatRoomId);

        if (room == null) {
            System.out.println("No chat room found for ID: " + chatRoomId);
            return;
        }

        System.out.println("Forwarding message to chat room: " + chatRoomId);

        // Send the message to the other user ONLY (exclude sender)
        room.broadcastMessage(message, senderSession);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        System.out.println("User disconnected: " + session.getId());
        // Remove from waitingUsers if present
        waitingUsers.removeIf(user -> user.getSession().equals(session));

        // Also remove from activeChats if present
        // We need to find which room they’re in
        ChatRoom roomToRemove = null;
        for (ChatRoom room : activeChats.values()) {
            if (room.containsSession(session)) {
                try {
                    room.notifyPartnerLeft(session);
                } catch (IOException e) {
                    e.printStackTrace();
                }
                roomToRemove = room;
                break;
            }
        }
        if (roomToRemove != null) {
            activeChats.remove(roomToRemove.getId());
            System.out.println("Removed room " + roomToRemove.getId() + " because user disconnected.");
        }
    }
}
