package com.groupware.controller;

import com.groupware.common.ApiResponse;
import com.groupware.dto.response.DepartmentResponse;
import com.groupware.dto.response.EmployeeResponse;
import com.groupware.dto.response.OrgTreeResponse;
import com.groupware.dto.response.PositionResponse;
import com.groupware.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 조직도 컨트롤러
 * 부서, 직원, 직급 조회 API
 */
@Slf4j
@RestController
@RequestMapping("/api/organization")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    /**
     * 전체 부서 목록 조회 (트리 구조)
     * GET /api/organization/departments
     */
    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<DepartmentResponse>>> getAllDepartments() {
        List<DepartmentResponse> departments = organizationService.getAllDepartments();
        return ResponseEntity.ok(ApiResponse.success("부서 목록 조회 성공", departments));
    }

    /**
     * 부서 상세 조회 + 부서원 목록
     * GET /api/organization/departments/{id}
     */
    @GetMapping("/departments/{id}")
    public ResponseEntity<ApiResponse<DepartmentResponse>> getDepartmentDetail(@PathVariable Long id) {
        DepartmentResponse dept = organizationService.getDepartmentDetail(id);
        if (dept == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("부서 상세 조회 성공", dept));
    }

    /**
     * 부서원 목록 조회
     * GET /api/organization/departments/{id}/members
     */
    @GetMapping("/departments/{id}/members")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getDepartmentMembers(@PathVariable Long id) {
        List<EmployeeResponse> employees = organizationService.getEmployeesByDepartment(id);
        return ResponseEntity.ok(ApiResponse.success("부서원 목록 조회 성공", employees));
    }

    /**
     * 전체 직원 목록 조회 (검색 지원)
     * GET /api/organization/employees?search=이름
     */
    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getAllEmployees(
            @RequestParam(required = false) String search) {
        List<EmployeeResponse> employees = organizationService.getAllEmployees(search);
        return ResponseEntity.ok(ApiResponse.success("직원 목록 조회 성공", employees));
    }

    /**
     * 직원 프로필 상세 조회
     * GET /api/organization/employees/{id}
     */
    @GetMapping("/employees/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployeeDetail(@PathVariable Long id) {
        EmployeeResponse employee = organizationService.getEmployeeById(id);
        if (employee == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(ApiResponse.success("직원 상세 조회 성공", employee));
    }

    /**
     * 직급 목록 조회
     * GET /api/organization/positions
     */
    @GetMapping("/positions")
    public ResponseEntity<ApiResponse<List<PositionResponse>>> getAllPositions() {
        List<PositionResponse> positions = organizationService.getAllPositions();
        return ResponseEntity.ok(ApiResponse.success("직급 목록 조회 성공", positions));
    }

    /**
     * 조직도 전체 트리 조회
     * GET /api/organization/tree
     */
    @GetMapping("/tree")
    public ResponseEntity<ApiResponse<OrgTreeResponse>> getOrgTree() {
        OrgTreeResponse tree = organizationService.getOrgTree();
        return ResponseEntity.ok(ApiResponse.success("조직도 조회 성공", tree));
    }
}
