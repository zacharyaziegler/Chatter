package com.onlinechatapp.websocket;

import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

public class ChatHandler extends TextWebSocketHandler {

    private static final List<UserSession> waitingUsers = new ArrayList<>();
    private static final Map<String, ChatRoom> activeChats = new HashMap<>();
    private static final AtomicInteger activeUserCount = new AtomicInteger(6);
    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        System.out.println("User connected: " + session.getId());
        activeUserCount.incrementAndGet();
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        String payload = message.getPayload();
        System.out.println("Received: " + payload);

        try {
            if (payload.startsWith("TAGS:")) {
                String[] tags = payload.substring(5).toLowerCase().split(",");
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
        // Clean the incoming tags by trimming and removing empty ones.
        List<String> sessionTags = Arrays.stream(tags)
                .map(String::trim)
                .filter(tag -> !tag.isEmpty())
                .collect(Collectors.toList());
        
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
    
                // Clean waiting user's tags as well.
                List<String> waitingTags = matchedUser.getTags().stream()
                        .map(String::trim)
                        .filter(tag -> !tag.isEmpty())
                        .collect(Collectors.toList());
    
                // Compute the common tags between the two.
                Set<String> common = new HashSet<>(sessionTags);
                common.retainAll(waitingTags);
    
                String tagInfoForSession;
                String tagInfoForWaiting;
    
                // Determine what each user should see.
                if (sessionTags.isEmpty() && waitingTags.isEmpty()) {
                    tagInfoForSession = "random";
                    tagInfoForWaiting = "random";
                } else if (!sessionTags.isEmpty() && waitingTags.isEmpty()) {
                    // The new user searched with tags, but the waiting user didn't set any.
                    tagInfoForSession = "no common match";
                    tagInfoForWaiting = "random";
                } else if (sessionTags.isEmpty() && !waitingTags.isEmpty()) {
                    tagInfoForSession = "random";
                    tagInfoForWaiting = "no common match";
                } else {
                    // Both users provided tags.
                    if (common.isEmpty()) {
                        tagInfoForSession = "no common match";
                        tagInfoForWaiting = "no common match";
                    } else {
                        String commonStr = String.join(",", common);
                        tagInfoForSession = commonStr;
                        tagInfoForWaiting = commonStr;
                    }
                }
    
                // Send MATCHED messages with the chat room id and individual tag info.
                String message = "MATCHED:" + chatRoomId + ":" + tagInfoForSession;
                session.sendMessage(new TextMessage(message));
                matchedUser.getSession().sendMessage(new TextMessage("MATCHED:" + chatRoomId + ":" + tagInfoForWaiting));
                
                System.out.println("Matched " + session.getId() + " (tags: " + sessionTags + ") with " +
                                   matchedUser.getSession().getId() + " (tags: " + waitingTags + ") (common: " + common + ")");
            } else {
                // Remove any duplicate waiting record for this session and add it.
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
        activeUserCount.decrementAndGet();
    }
}
