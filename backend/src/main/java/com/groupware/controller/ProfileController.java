package com.groupware.controller;

import com.groupware.common.ApiResponse;
import com.groupware.dto.response.EmployeeResponse;
import com.groupware.mapper.AdminMapper;
import com.groupware.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

/**
 * 프로필 컨트롤러
 * 내 프로필 조회/수정, 프로필 이미지 업로드
 */
@Slf4j
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final AdminMapper adminMapper;

    @Value("${app.upload.path:/app/groupware-uploads}")
    private String uploadPath;

    private UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) auth.getPrincipal();
        }
        return null;
    }

    /**
     * 내 프로필 조회
     * GET /api/profile/me
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getMyProfile() {
        UserPrincipal user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다."));

        List<EmployeeResponse> list = adminMapper.findAllUsersForAdmin(null);
        EmployeeResponse profile = list.stream()
                .filter(e -> user.getUserId().equals(e.getUserId()))
                .findFirst()
                .orElse(null);

        if (profile == null) {
            // 프로필 레코드 없는 경우 기본 정보만 반환
            EmployeeResponse basic = new EmployeeResponse();
            basic.setUserId(user.getUserId());
            basic.setUsername(user.getUsername());
            basic.setName(user.getName());
            basic.setRole(user.getRole());
            return ResponseEntity.ok(ApiResponse.success("프로필 조회 성공", basic));
        }
        return ResponseEntity.ok(ApiResponse.success("프로필 조회 성공", profile));
    }

    /**
     * 내 정보 수정 (phone, joinedDate)
     * PUT /api/profile/me
     */
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<Void>> updateMyProfile(@RequestBody Map<String, Object> body) {
        UserPrincipal user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다."));

        String phone = (String) body.get("phone");
        String joinedDate = (String) body.get("joinedDate");

        try {
            adminMapper.upsertUserProfile(user.getUserId(), null, null, phone, joinedDate);
            return ResponseEntity.ok(ApiResponse.success("프로필 수정 성공"));
        } catch (Exception e) {
            log.error("프로필 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("수정 실패: " + e.getMessage()));
        }
    }

    /**
     * 프로필 이미지 업로드
     * POST /api/profile/me/image
     */
    @PostMapping("/me/image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadProfileImage(
            @RequestParam("file") MultipartFile file) {
        UserPrincipal user = getCurrentUser();
        if (user == null) return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다."));

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("파일이 비어 있습니다."));
        }

        try {
            // 저장 디렉토리 생성
            Path profileDir = Paths.get(uploadPath, "profiles");
            Files.createDirectories(profileDir);

            // 파일 저장: {userId}.jpg (확장자 유지하지 않고 통일)
            String originalFilename = file.getOriginalFilename();
            String ext = "jpg";
            if (originalFilename != null && originalFilename.contains(".")) {
                ext = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
            }
            String filename = user.getUserId() + "." + ext;
            Path targetPath = profileDir.resolve(filename);
            file.transferTo(targetPath.toFile());

            // DB에 경로 업데이트 (프로필 레코드가 없을 경우 먼저 생성)
            String imagePath = "/profiles/" + filename;
            adminMapper.upsertUserProfile(user.getUserId(), null, null, null, null);
            adminMapper.updateProfileImagePath(user.getUserId(), imagePath);

            return ResponseEntity.ok(ApiResponse.success("프로필 이미지 업로드 성공",
                    Map.of("imagePath", imagePath)));
        } catch (IOException e) {
            log.error("프로필 이미지 업로드 실패: {}", e.getMessage());
            return ResponseEntity.status(500).body(ApiResponse.error("업로드 실패: " + e.getMessage()));
        }
    }

}
