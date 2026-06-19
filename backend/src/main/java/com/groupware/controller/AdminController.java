package com.groupware.controller;

import com.groupware.common.ApiResponse;
import com.groupware.dto.response.DepartmentResponse;
import com.groupware.dto.response.EmployeeResponse;
import com.groupware.dto.response.PositionResponse;
import com.groupware.entity.Board;
import com.groupware.entity.Department;
import com.groupware.entity.MeetingRoom;
import com.groupware.security.UserPrincipal;
import com.groupware.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 관리자 컨트롤러
 * ADMIN 역할만 접근 가능한 관리 기능 API
 */
@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /** 현재 사용자가 ADMIN인지 확인 */
    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return "ADMIN".equals(((UserPrincipal) auth.getPrincipal()).getRole());
        }
        return false;
    }

    private ResponseEntity<ApiResponse<Void>> forbiddenResponse() {
        return ResponseEntity.status(403).body(ApiResponse.error("관리자 권한이 필요합니다."));
    }

    // ========== 사용자 관리 ==========

    /**
     * 전체 사용자 목록
     * GET /api/admin/users?search=키워드
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getUsers(
            @RequestParam(required = false) String search) {
        if (!isAdmin()) return ResponseEntity.status(403).body(ApiResponse.error("관리자 권한이 필요합니다."));
        List<EmployeeResponse> users = adminService.getAllUsers(search);
        return ResponseEntity.ok(ApiResponse.success("사용자 목록 조회 성공", users));
    }

    /**
     * 사용자 프로필 업데이트 (부서, 직급, 입사일)
     * PUT /api/admin/users/{id}/profile
     */
    @PutMapping("/users/{id}/profile")
    public ResponseEntity<ApiResponse<Void>> updateUserProfile(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        if (!isAdmin()) return forbiddenResponse();
        try {
            Long departmentId = body.get("departmentId") != null
                    ? Long.valueOf(body.get("departmentId").toString()) : null;
            Long positionId = body.get("positionId") != null
                    ? Long.valueOf(body.get("positionId").toString()) : null;
            String phone = (String) body.get("phone");
            String joinedDate = (String) body.get("joinedDate");
            adminService.updateUserProfile(id, departmentId, positionId, phone, joinedDate);
            return ResponseEntity.ok(ApiResponse.success("사용자 프로필 업데이트 성공"));
        } catch (Exception e) {
            log.error("사용자 프로필 업데이트 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error("업데이트 실패: " + e.getMessage()));
        }
    }

    // ========== 부서 관리 ==========

    /**
     * 부서 목록
     * GET /api/admin/departments
     */
    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getDepartments() {
        if (!isAdmin()) return ResponseEntity.status(403).body(ApiResponse.error("관리자 권한이 필요합니다."));
        return ResponseEntity.ok(ApiResponse.success("부서 목록 조회 성공", adminService.getAllDepartments()));
    }

    /**
     * 부서 생성
     * POST /api/admin/departments
     */
    @PostMapping("/departments")
    public ResponseEntity<ApiResponse<Department>> createDepartment(@RequestBody Department department) {
        if (!isAdmin()) return ResponseEntity.status(403).body(ApiResponse.error("관리자 권한이 필요합니다."));
        Department created = adminService.createDepartment(department);
        return ResponseEntity.ok(ApiResponse.success("부서 생성 성공", created));
    }

    /**
     * 부서 수정
     * PUT /api/admin/departments/{id}
     */
    @PutMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<Void>> updateDepartment(
            @PathVariable Long id, @RequestBody Department department) {
        if (!isAdmin()) return forbiddenResponse();
        boolean updated = adminService.updateDepartment(id, department);
        if (!updated) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ApiResponse.success("부서 수정 성공"));
    }

    /**
     * 부서 삭제
     * DELETE /api/admin/departments/{id}
     */
    @DeleteMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDepartment(@PathVariable Long id) {
        if (!isAdmin()) return forbiddenResponse();
        boolean deleted = adminService.deleteDepartment(id);
        if (!deleted) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ApiResponse.success("부서 삭제 성공"));
    }

    // ========== 직급 관리 ==========

    /**
     * 직급 목록
     * GET /api/admin/positions
     */
    @GetMapping("/positions")
    public ResponseEntity<ApiResponse<List<PositionResponse>>> getPositions() {
        if (!isAdmin()) return ResponseEntity.status(403).body(ApiResponse.error("관리자 권한이 필요합니다."));
        return ResponseEntity.ok(ApiResponse.success("직급 목록 조회 성공", adminService.getAllPositions()));
    }

    /**
     * 직급 생성
     * POST /api/admin/positions
     */
    @PostMapping("/positions")
    public ResponseEntity<ApiResponse<Void>> createPosition(@RequestBody Map<String, Object> body) {
        if (!isAdmin()) return forbiddenResponse();
        String name = (String) body.get("name");
        int level = body.get("level") != null ? Integer.parseInt(body.get("level").toString()) : 1;
        int approvalRank = body.get("approvalRank") != null ? Integer.parseInt(body.get("approvalRank").toString()) : 0;
        adminService.createPosition(name, level, approvalRank);
        return ResponseEntity.ok(ApiResponse.success("직급 생성 성공"));
    }

    /**
     * 직급 수정
     * PUT /api/admin/positions/{id}
     */
    @PutMapping("/positions/{id}")
    public ResponseEntity<ApiResponse<Void>> updatePosition(
            @PathVariable Long id, @RequestBody Map<String, Object> body) {
        if (!isAdmin()) return forbiddenResponse();
        String name = (String) body.get("name");
        int level = body.get("level") != null ? Integer.parseInt(body.get("level").toString()) : 1;
        int approvalRank = body.get("approvalRank") != null ? Integer.parseInt(body.get("approvalRank").toString()) : 0;
        adminService.updatePosition(id, name, level, approvalRank);
        return ResponseEntity.ok(ApiResponse.success("직급 수정 성공"));
    }

    // ========== 통계/대시보드 ==========

    /**
     * 전체 통계
     * GET /api/admin/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        if (!isAdmin()) return ResponseEntity.status(403).body(ApiResponse.error("관리자 권한이 필요합니다."));
        Map<String, Object> stats = adminService.getAdminStats();
        return ResponseEntity.ok(ApiResponse.success("통계 조회 성공", stats));
    }

    // ========== 게시판 관리 ==========

    /**
     * 게시판 목록
     * GET /api/admin/boards
     */
    @GetMapping("/boards")
    public ResponseEntity<ApiResponse<List<Board>>> getBoards() {
        if (!isAdmin()) return ResponseEntity.status(403).body(ApiResponse.error("관리자 권한이 필요합니다."));
        return ResponseEntity.ok(ApiResponse.success("게시판 목록 조회 성공", adminService.getAllBoards()));
    }

    /**
     * 게시판 생성
     * POST /api/admin/boards
     */
    @PostMapping("/boards")
    public ResponseEntity<ApiResponse<Board>> createBoard(@RequestBody Board board) {
        if (!isAdmin()) return ResponseEntity.status(403).body(ApiResponse.error("관리자 권한이 필요합니다."));
        Board created = adminService.createBoard(board);
        return ResponseEntity.ok(ApiResponse.success("게시판 생성 성공", created));
    }

    /**
     * 게시판 수정
     * PUT /api/admin/boards/{id}
     */
    @PutMapping("/boards/{id}")
    public ResponseEntity<ApiResponse<Void>> updateBoard(@PathVariable Long id, @RequestBody Board board) {
        if (!isAdmin()) return forbiddenResponse();
        adminService.updateBoard(id, board);
        return ResponseEntity.ok(ApiResponse.success("게시판 수정 성공"));
    }

    /**
     * 게시판 삭제
     * DELETE /api/admin/boards/{id}
     */
    @DeleteMapping("/boards/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBoard(@PathVariable Long id) {
        if (!isAdmin()) return forbiddenResponse();
        adminService.deleteBoard(id);
        return ResponseEntity.ok(ApiResponse.success("게시판 삭제 성공"));
    }

    // ========== 회의실 관리 ==========

    /**
     * 회의실 목록
     * GET /api/admin/meeting-rooms
     */
    @GetMapping("/meeting-rooms")
    public ResponseEntity<ApiResponse<List<MeetingRoom>>> getMeetingRooms() {
        if (!isAdmin()) return ResponseEntity.status(403).body(ApiResponse.error("관리자 권한이 필요합니다."));
        return ResponseEntity.ok(ApiResponse.success("회의실 목록 조회 성공", adminService.getAllMeetingRooms()));
    }

    /**
     * 회의실 추가
     * POST /api/admin/meeting-rooms
     */
    @PostMapping("/meeting-rooms")
    public ResponseEntity<ApiResponse<MeetingRoom>> createMeetingRoom(@RequestBody MeetingRoom room) {
        if (!isAdmin()) return ResponseEntity.status(403).body(ApiResponse.error("관리자 권한이 필요합니다."));
        MeetingRoom created = adminService.createMeetingRoom(room);
        return ResponseEntity.ok(ApiResponse.success("회의실 추가 성공", created));
    }

    /**
     * 회의실 수정
     * PUT /api/admin/meeting-rooms/{id}
     */
    @PutMapping("/meeting-rooms/{id}")
    public ResponseEntity<ApiResponse<Void>> updateMeetingRoom(@PathVariable Long id, @RequestBody MeetingRoom room) {
        if (!isAdmin()) return forbiddenResponse();
        adminService.updateMeetingRoom(id, room);
        return ResponseEntity.ok(ApiResponse.success("회의실 수정 성공"));
    }

    /**
     * 회의실 삭제
     * DELETE /api/admin/meeting-rooms/{id}
     */
    @DeleteMapping("/meeting-rooms/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMeetingRoom(@PathVariable Long id) {
        if (!isAdmin()) return forbiddenResponse();
        adminService.deleteMeetingRoom(id);
        return ResponseEntity.ok(ApiResponse.success("회의실 삭제 성공"));
    }
}
