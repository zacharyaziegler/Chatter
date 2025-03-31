package com.onlinechatapp.websocket;

import org.springframework.web.socket.WebSocketSession;

import java.util.Arrays;
import java.util.List;

public class UserSession {
    private WebSocketSession session;
    private List<String> tags;

    public UserSession(WebSocketSession session, String[] tags) {
        this.session = session;
        this.tags = Arrays.asList(tags);
    }

    public WebSocketSession getSession() {
        return session;
    }

    public List<String> getTags() {
        return tags;
    }

    public boolean matchesTags(String[] inputTags) {
        for (String tag : inputTags) {
            if (tags.contains(tag)) {
                return true;
            }
        }
        return false;
    }


}