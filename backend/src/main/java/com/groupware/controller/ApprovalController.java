package com.groupware.controller;

import com.groupware.common.ApiResponse;
import com.groupware.entity.ApprovalDocument;
import com.groupware.entity.ApprovalTemplate;
import com.groupware.security.UserPrincipal;
import com.groupware.service.ApprovalService;
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
@RequestMapping("/api/approval")
@RequiredArgsConstructor
public class ApprovalController {

    private final ApprovalService approvalService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return ((UserPrincipal) auth.getPrincipal()).getUserId();
        }
        return null;
    }

    /**
     * 결재 템플릿 목록
     * GET /api/approval/templates
     */
    @GetMapping("/templates")
    public ResponseEntity<ApiResponse<List<ApprovalTemplate>>> getTemplates() {
        List<ApprovalTemplate> templates = approvalService.getTemplates();
        return ResponseEntity.ok(ApiResponse.success("템플릿 목록 조회 성공", templates));
    }

    /**
     * 내 문서 목록
     * GET /api/approval/documents?status=&type=SENT|RECEIVED
     */
    @GetMapping("/documents")
    public ResponseEntity<ApiResponse<List<ApprovalDocument>>> getDocuments(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "SENT") String type) {
        Long userId = getCurrentUserId();
        List<ApprovalDocument> docs = approvalService.getDocuments(userId, status, type);
        return ResponseEntity.ok(ApiResponse.success("문서 목록 조회 성공", docs));
    }

    /**
     * 문서 상세
     * GET /api/approval/documents/{id}
     */
    @GetMapping("/documents/{id}")
    public ResponseEntity<ApiResponse<ApprovalDocument>> getDocument(@PathVariable Long id) {
        ApprovalDocument doc = approvalService.getDocument(id);
        if (doc == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("문서 조회 성공", doc));
    }

    /**
     * 문서 작성
     * POST /api/approval/documents
     */
    @PostMapping("/documents")
    public ResponseEntity<ApiResponse<ApprovalDocument>> createDocument(@RequestBody Map<String, Object> body) {
        Long userId = getCurrentUserId();
        try {
            ApprovalDocument doc = approvalService.createDocument(body, userId);
            return ResponseEntity.ok(ApiResponse.success("문서 작성 성공", doc));
        } catch (Exception e) {
            log.error("문서 작성 실패", e);
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 결재 상신
     * PUT /api/approval/documents/{id}/submit
     */
    @PutMapping("/documents/{id}/submit")
    public ResponseEntity<ApiResponse<ApprovalDocument>> submitDocument(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        try {
            ApprovalDocument doc = approvalService.submitDocument(id, userId);
            return ResponseEntity.ok(ApiResponse.success("결재 상신 성공", doc));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 결재 승인
     * PUT /api/approval/documents/{id}/approve
     */
    @PutMapping("/documents/{id}/approve")
    public ResponseEntity<ApiResponse<ApprovalDocument>> approveDocument(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body) {
        Long userId = getCurrentUserId();
        String comment = body != null && body.get("comment") != null ? body.get("comment").toString() : null;
        try {
            ApprovalDocument doc = approvalService.approveDocument(id, userId, comment);
            return ResponseEntity.ok(ApiResponse.success("결재 승인 성공", doc));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 결재 반려
     * PUT /api/approval/documents/{id}/reject
     */
    @PutMapping("/documents/{id}/reject")
    public ResponseEntity<ApiResponse<ApprovalDocument>> rejectDocument(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        Long userId = getCurrentUserId();
        String reason = body != null && body.get("reason") != null ? body.get("reason").toString() : "반려";
        try {
            ApprovalDocument doc = approvalService.rejectDocument(id, userId, reason);
            return ResponseEntity.ok(ApiResponse.success("결재 반려 성공", doc));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 문서 삭제 (DRAFT만)
     * DELETE /api/approval/documents/{id}
     */
    @DeleteMapping("/documents/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        boolean deleted = approvalService.deleteDocument(id, userId);
        if (!deleted) {
            return ResponseEntity.badRequest().body(ApiResponse.error("삭제할 수 없습니다 (임시저장 상태만 삭제 가능)"));
        }
        return ResponseEntity.ok(ApiResponse.success("문서 삭제 성공"));
    }

    /**
     * 내가 결재해야 할 목록
     * GET /api/approval/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<ApprovalDocument>>> getPendingDocuments() {
        Long userId = getCurrentUserId();
        List<ApprovalDocument> docs = approvalService.getPendingDocuments(userId);
        return ResponseEntity.ok(ApiResponse.success("결재 대기 목록 조회 성공", docs));
    }
}
