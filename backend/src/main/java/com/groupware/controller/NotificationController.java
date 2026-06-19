package com.groupware.controller;

import com.groupware.common.ApiResponse;
import com.groupware.entity.Notification;
import com.groupware.security.UserPrincipal;
import com.groupware.service.NotificationService;
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
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return ((UserPrincipal) auth.getPrincipal()).getUserId();
        }
        return null;
    }

    /**
     * 내 알림 목록
     * GET /api/notifications?unreadOnly=true
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
            @RequestParam(defaultValue = "false") boolean unreadOnly) {
        Long userId = getCurrentUserId();
        List<Notification> notifications = notificationService.getNotifications(userId, unreadOnly);
        return ResponseEntity.ok(ApiResponse.success("알림 목록 조회 성공", notifications));
    }

    /**
     * 읽음 처리
     * PUT /api/notifications/{id}/read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        boolean result = notificationService.markAsRead(id, userId);
        if (!result) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("읽음 처리 완료"));
    }

    /**
     * 전체 읽음 처리
     * PUT /api/notifications/read-all
     */
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        Long userId = getCurrentUserId();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success("전체 읽음 처리 완료"));
    }

    /**
     * 미읽은 알림 수
     * GET /api/notifications/count
     */
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> getUnreadCount() {
        Long userId = getCurrentUserId();
        int count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success("미읽은 알림 수 조회 성공", Map.of("count", count)));
    }
}
