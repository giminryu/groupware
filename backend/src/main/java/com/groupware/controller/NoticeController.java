package com.groupware.controller;

import com.groupware.common.ApiResponse;
import com.groupware.dto.request.NoticeRequest;
import com.groupware.entity.Notice;
import com.groupware.security.UserPrincipal;
import com.groupware.service.NoticeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return ((UserPrincipal) auth.getPrincipal()).getUserId();
        }
        return null;
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            String role = ((UserPrincipal) auth.getPrincipal()).getRole();
            return "ADMIN".equals(role);
        }
        return false;
    }

    /**
     * 공지사항 목록 조회
     * GET /api/notices?page=0&size=20&search=검색어
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotices(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        Long userId = getCurrentUserId();
        Map<String, Object> result = noticeService.getNotices(page, size, search, userId);
        return ResponseEntity.ok(ApiResponse.success("공지사항 목록 조회 성공", result));
    }

    /**
     * 공지사항 상세 조회
     * GET /api/notices/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Notice>> getNoticeDetail(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        Notice notice = noticeService.getNoticeDetail(id, userId);
        if (notice == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("공지사항 조회 성공", notice));
    }

    /**
     * 공지사항 작성 (ADMIN만)
     * POST /api/notices
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Notice>> createNotice(@RequestBody NoticeRequest request) {
        if (!isAdmin()) {
            return ResponseEntity.status(403).body(ApiResponse.error("관리자만 공지사항을 작성할 수 있습니다"));
        }
        Long userId = getCurrentUserId();
        Notice notice = noticeService.createNotice(request, userId);
        return ResponseEntity.ok(ApiResponse.success("공지사항 작성 성공", notice));
    }

    /**
     * 공지사항 수정 (작성자/ADMIN)
     * PUT /api/notices/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Notice>> updateNotice(@PathVariable Long id,
                                                             @RequestBody NoticeRequest request) {
        Notice notice = noticeService.updateNotice(id, request);
        if (notice == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("공지사항 수정 성공", notice));
    }

    /**
     * 공지사항 삭제 (작성자/ADMIN)
     * DELETE /api/notices/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotice(@PathVariable Long id) {
        boolean deleted = noticeService.deleteNotice(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("공지사항 삭제 성공"));
    }

    /**
     * 열람 확인
     * POST /api/notices/{id}/view
     */
    @PostMapping("/{id}/view")
    public ResponseEntity<ApiResponse<Void>> markViewed(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        noticeService.markViewed(id, userId);
        return ResponseEntity.ok(ApiResponse.success("열람 확인 완료"));
    }
}
