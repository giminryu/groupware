package com.groupware.controller;

import com.groupware.common.ApiResponse;
import com.groupware.dto.request.FileUpdateRequest;
import com.groupware.dto.request.FolderRequest;
import com.groupware.entity.FileInfo;
import com.groupware.security.UserPrincipal;
import com.groupware.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return ((UserPrincipal) auth.getPrincipal()).getUserId();
        }
        return null;
    }

    /**
     * 파일/폴더 목록 조회
     * GET /api/files?parentId=&departmentId=
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<FileInfo>>> getFiles(
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) Long departmentId) {
        Long userId = getCurrentUserId();
        List<FileInfo> files = fileService.getFiles(parentId, departmentId, userId);
        return ResponseEntity.ok(ApiResponse.success("파일 목록 조회 성공", files));
    }

    /**
     * 공유된 파일 목록
     * GET /api/files/shared
     */
    @GetMapping("/shared")
    public ResponseEntity<ApiResponse<List<FileInfo>>> getSharedFiles() {
        Long userId = getCurrentUserId();
        List<FileInfo> files = fileService.getSharedFiles(userId);
        return ResponseEntity.ok(ApiResponse.success("공유 파일 목록 조회 성공", files));
    }

    /**
     * 파일 상세 조회
     * GET /api/files/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FileInfo>> getFileDetail(@PathVariable Long id) {
        FileInfo fileInfo = fileService.getFileDetail(id);
        if (fileInfo == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ApiResponse.success("파일 조회 성공", fileInfo));
    }

    /**
     * 파일 업로드
     * POST /api/files/upload (multipart)
     */
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<FileInfo>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long parentId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(defaultValue = "PRIVATE") String visibility) {
        Long userId = getCurrentUserId();
        try {
            FileInfo fileInfo = fileService.uploadFile(file, parentId, departmentId, visibility, userId);
            return ResponseEntity.ok(ApiResponse.success("파일 업로드 성공", fileInfo));
        } catch (IOException e) {
            log.error("파일 업로드 실패", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("파일 업로드 실패: " + e.getMessage()));
        }
    }

    /**
     * 폴더 생성
     * POST /api/files/folder
     */
    @PostMapping("/folder")
    public ResponseEntity<ApiResponse<FileInfo>> createFolder(@RequestBody FolderRequest request) {
        Long userId = getCurrentUserId();
        FileInfo folder = fileService.createFolder(request, userId);
        return ResponseEntity.ok(ApiResponse.success("폴더 생성 성공", folder));
    }

    /**
     * 파일 수정 (이름/공개범위)
     * PUT /api/files/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FileInfo>> updateFile(@PathVariable Long id,
                                                              @RequestBody FileUpdateRequest request) {
        Long userId = getCurrentUserId();
        try {
            FileInfo fileInfo = fileService.updateFile(id, request, userId);
            if (fileInfo == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(ApiResponse.success("파일 수정 성공", fileInfo));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 파일 삭제 (soft delete)
     * DELETE /api/files/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFile(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        try {
            boolean deleted = fileService.deleteFile(id, userId);
            if (!deleted) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(ApiResponse.success("파일 삭제 성공"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 파일 다운로드
     * GET /api/files/{id}/download
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        try {
            Resource resource = fileService.downloadFile(id, userId);
            if (resource == null) return ResponseEntity.notFound().build();

            String fileName = fileService.getOriginalFileName(id);
            String encodedName = URLEncoder.encode(fileName, StandardCharsets.UTF_8).replace("+", "%20");

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName)
                    .body(resource);
        } catch (Exception e) {
            log.error("파일 다운로드 실패", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
