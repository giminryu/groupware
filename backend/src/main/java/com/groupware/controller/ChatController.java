package com.groupware.controller;

import com.groupware.common.ApiResponse;
import com.groupware.entity.ChatMessage;
import com.groupware.entity.ChatRoom;
import com.groupware.security.UserPrincipal;
import com.groupware.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return ((UserPrincipal) auth.getPrincipal()).getUserId();
        }
        return null;
    }

    /**
     * 내 채팅방 목록
     * GET /api/chat/rooms
     */
    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<ChatRoom>>> getRooms() {
        Long userId = getCurrentUserId();
        List<ChatRoom> rooms = chatService.getRooms(userId);
        return ResponseEntity.ok(ApiResponse.success("채팅방 목록 조회 성공", rooms));
    }

    /**
     * 채팅방 생성
     * POST /api/chat/rooms
     */
    @PostMapping("/rooms")
    public ResponseEntity<ApiResponse<ChatRoom>> createRoom(@RequestBody Map<String, Object> body) {
        Long userId = getCurrentUserId();
        String name = body.get("name") != null ? body.get("name").toString() : null;
        String type = body.get("type") != null ? body.get("type").toString() : "GROUP";

        @SuppressWarnings("unchecked")
        List<Integer> memberIdInts = (List<Integer>) body.get("memberIds");
        List<Long> memberIds = null;
        if (memberIdInts != null) {
            memberIds = memberIdInts.stream().map(Long::valueOf).collect(java.util.stream.Collectors.toList());
        }

        ChatRoom room = chatService.createRoom(name, type, userId, memberIds);
        return ResponseEntity.ok(ApiResponse.success("채팅방 생성 성공", room));
    }

    /**
     * 메시지 목록 (최근 50개)
     * GET /api/chat/rooms/{id}/messages?before=messageId
     */
    @GetMapping("/rooms/{id}/messages")
    public ResponseEntity<ApiResponse<List<ChatMessage>>> getMessages(
            @PathVariable Long id,
            @RequestParam(required = false) Long before) {
        Long userId = getCurrentUserId();
        if (!chatService.isMember(id, userId)) {
            return ResponseEntity.status(403).body(ApiResponse.error("채팅방 멤버가 아닙니다"));
        }
        List<ChatMessage> messages = chatService.getMessages(id, before);
        return ResponseEntity.ok(ApiResponse.success("메시지 목록 조회 성공", messages));
    }

    /**
     * 1:1 채팅방 생성/조회
     * POST /api/chat/rooms/direct
     */
    @PostMapping("/rooms/direct")
    public ResponseEntity<ApiResponse<ChatRoom>> getOrCreateDirectRoom(@RequestBody Map<String, Object> body) {
        Long userId = getCurrentUserId();
        Long targetUserId = Long.valueOf(body.get("targetUserId").toString());
        ChatRoom room = chatService.getOrCreateDirectRoom(userId, targetUserId);
        return ResponseEntity.ok(ApiResponse.success("1:1 채팅방 조회/생성 성공", room));
    }

    /**
     * 읽음 처리
     * PUT /api/chat/rooms/{id}/read
     */
    @PutMapping("/rooms/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        chatService.updateLastRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success("읽음 처리 완료"));
    }

    /**
     * 사용자 온라인 상태 (현재는 항상 offline - WebSocket 연결 기반으로 추후 확장)
     * GET /api/chat/users/status
     */
    @GetMapping("/users/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUsersStatus() {
        return ResponseEntity.ok(ApiResponse.success("사용자 상태 조회 성공", Map.of("onlineUsers", List.of())));
    }
}
