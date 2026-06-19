package com.groupware.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.groupware.security.JwtTokenProvider;
import com.groupware.service.ChatService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

    // roomId -> Set<WebSocketSession>
    private final Map<Long, Set<WebSocketSession>> roomSessions = new ConcurrentHashMap<>();
    // sessionId -> userId
    private final Map<String, Long> sessionUserMap = new ConcurrentHashMap<>();

    @Autowired
    private ChatService chatService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String token = getTokenFromSession(session);
        if (token != null && jwtTokenProvider.validateToken(token)) {
            Long userId = jwtTokenProvider.getUserIdFromToken(token);
            sessionUserMap.put(session.getId(), userId);
            log.info("WebSocket 연결 완료: sessionId={}, userId={}", session.getId(), userId);
        } else {
            log.warn("WebSocket 인증 실패: sessionId={}", session.getId());
            try {
                session.close(CloseStatus.NOT_ACCEPTABLE);
            } catch (IOException e) {
                log.error("WebSocket 세션 종료 실패", e);
            }
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
        String type = (String) payload.get("type");
        Long userId = sessionUserMap.get(session.getId());

        if (userId == null) {
            log.warn("인증되지 않은 세션에서 메시지 수신: sessionId={}", session.getId());
            return;
        }

        if (payload.get("roomId") == null) {
            log.warn("roomId 누락: sessionId={}", session.getId());
            return;
        }

        Long roomId = Long.valueOf(payload.get("roomId").toString());

        switch (type) {
            case "JOIN":
                roomSessions.computeIfAbsent(roomId, k -> ConcurrentHashMap.newKeySet()).add(session);
                chatService.updateLastRead(roomId, userId);
                log.info("채팅방 참여: userId={}, roomId={}", userId, roomId);
                break;

            case "SEND":
                String content = (String) payload.get("content");
                if (content == null || content.trim().isEmpty()) break;

                Long messageId = chatService.saveMessage(roomId, userId, content);
                Map<String, Object> response = new LinkedHashMap<>();
                response.put("type", "MESSAGE");
                response.put("id", messageId);
                response.put("roomId", roomId);
                response.put("senderId", userId);
                response.put("content", content);
                response.put("createdAt", LocalDateTime.now().toString());

                broadcastToRoom(roomId, objectMapper.writeValueAsString(response));
                log.info("메시지 브로드캐스트: userId={}, roomId={}, messageId={}", userId, roomId, messageId);
                break;

            case "LEAVE":
                Set<WebSocketSession> sessions = roomSessions.get(roomId);
                if (sessions != null) {
                    sessions.remove(session);
                }
                log.info("채팅방 퇴장: userId={}, roomId={}", userId, roomId);
                break;

            default:
                log.warn("알 수 없는 메시지 타입: type={}", type);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        Long userId = sessionUserMap.remove(session.getId());
        roomSessions.values().forEach(s -> s.remove(session));
        log.info("WebSocket 연결 종료: sessionId={}, userId={}, status={}", session.getId(), userId, status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("WebSocket 전송 오류: sessionId={}", session.getId(), exception);
        sessionUserMap.remove(session.getId());
        roomSessions.values().forEach(s -> s.remove(session));
    }

    private void broadcastToRoom(Long roomId, String message) {
        Set<WebSocketSession> sessions = roomSessions.getOrDefault(roomId, Collections.emptySet());
        sessions.removeIf(s -> !s.isOpen());
        sessions.forEach(s -> {
            try {
                s.sendMessage(new TextMessage(message));
            } catch (IOException e) {
                log.error("메시지 전송 실패: sessionId={}", s.getId(), e);
            }
        });
    }

    private String getTokenFromSession(WebSocketSession session) {
        String query = session.getUri() != null ? session.getUri().getQuery() : null;
        if (query == null) return null;
        for (String param : query.split("&")) {
            String[] kv = param.split("=", 2);
            if (kv.length == 2 && "token".equals(kv[0])) return kv[1];
        }
        return null;
    }
}
