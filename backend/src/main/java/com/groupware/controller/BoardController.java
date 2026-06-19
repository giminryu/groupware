package com.groupware.controller;

import com.groupware.common.ApiResponse;
import com.groupware.dto.request.CommentRequest;
import com.groupware.dto.request.PostRequest;
import com.groupware.entity.Board;
import com.groupware.entity.Comment;
import com.groupware.entity.Post;
import com.groupware.security.UserPrincipal;
import com.groupware.service.BoardService;
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
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

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
            return "ADMIN".equals(((UserPrincipal) auth.getPrincipal()).getRole());
        }
        return false;
    }

    /**
     * 게시판 목록 조회
     * GET /api/boards
     */
    @GetMapping("/api/boards")
    public ResponseEntity<ApiResponse<List<Board>>> getBoards() {
        List<Board> boards = boardService.getAllBoards();
        return ResponseEntity.ok(ApiResponse.success("게시판 목록 조회 성공", boards));
    }

    /**
     * 게시물 목록 조회
     * GET /api/boards/{boardId}/posts
     */
    @GetMapping("/api/boards/{boardId}/posts")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPosts(
            @PathVariable Long boardId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        Map<String, Object> result = boardService.getPosts(boardId, page, size, search);
        return ResponseEntity.ok(ApiResponse.success("게시물 목록 조회 성공", result));
    }

    /**
     * 게시물 상세 조회
     * GET /api/posts/{id}
     */
    @GetMapping("/api/posts/{id}")
    public ResponseEntity<ApiResponse<Post>> getPostDetail(@PathVariable Long id) {
        Post post = boardService.getPostDetail(id);
        if (post == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ApiResponse.success("게시물 조회 성공", post));
    }

    /**
     * 게시물 작성
     * POST /api/boards/{boardId}/posts
     */
    @PostMapping("/api/boards/{boardId}/posts")
    public ResponseEntity<ApiResponse<Post>> createPost(@PathVariable Long boardId,
                                                          @RequestBody PostRequest request) {
        Long userId = getCurrentUserId();
        Post post = boardService.createPost(boardId, request, userId);
        return ResponseEntity.ok(ApiResponse.success("게시물 작성 성공", post));
    }

    /**
     * 게시물 수정
     * PUT /api/posts/{id}
     */
    @PutMapping("/api/posts/{id}")
    public ResponseEntity<ApiResponse<Post>> updatePost(@PathVariable Long id,
                                                          @RequestBody PostRequest request) {
        Long userId = getCurrentUserId();
        try {
            Post post = boardService.updatePost(id, request, userId);
            if (post == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(ApiResponse.success("게시물 수정 성공", post));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 게시물 삭제
     * DELETE /api/posts/{id}
     */
    @DeleteMapping("/api/posts/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        try {
            boolean deleted = boardService.deletePost(id, userId, isAdmin());
            if (!deleted) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(ApiResponse.success("게시물 삭제 성공"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 댓글 목록 조회
     * GET /api/posts/{id}/comments
     */
    @GetMapping("/api/posts/{id}/comments")
    public ResponseEntity<ApiResponse<List<Comment>>> getComments(@PathVariable Long id) {
        List<Comment> comments = boardService.getComments(id);
        return ResponseEntity.ok(ApiResponse.success("댓글 목록 조회 성공", comments));
    }

    /**
     * 댓글 작성
     * POST /api/posts/{id}/comments
     */
    @PostMapping("/api/posts/{id}/comments")
    public ResponseEntity<ApiResponse<Comment>> createComment(@PathVariable Long id,
                                                               @RequestBody CommentRequest request) {
        Long userId = getCurrentUserId();
        Comment comment = boardService.createComment(id, request, userId);
        return ResponseEntity.ok(ApiResponse.success("댓글 작성 성공", comment));
    }

    /**
     * 댓글 삭제
     * DELETE /api/comments/{id}
     */
    @DeleteMapping("/api/comments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        try {
            boolean deleted = boardService.deleteComment(id, userId, isAdmin());
            if (!deleted) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(ApiResponse.success("댓글 삭제 성공"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        }
    }
}
