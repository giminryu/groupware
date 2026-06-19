package com.groupware.service;

import com.groupware.dto.response.DepartmentResponse;
import com.groupware.dto.response.EmployeeResponse;
import com.groupware.dto.response.OrgTreeResponse;
import com.groupware.dto.response.PositionResponse;
import com.groupware.mapper.OrganizationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 조직도 서비스
 * 부서 트리 구성, 직원 조회 등 비즈니스 로직
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationMapper organizationMapper;

    /**
     * 전체 부서 목록 조회 (트리 구조 반환)
     */
    public List<DepartmentResponse> getAllDepartments() {
        List<DepartmentResponse> allDepts = organizationMapper.findAllDepartments();

        // 각 부서의 멤버 수 설정
        for (DepartmentResponse dept : allDepts) {
            dept.setMemberCount(organizationMapper.countMembersByDepartment(dept.getId()));
        }

        return buildTree(allDepts);
    }

    /**
     * 부서 상세 조회 (부서원 목록 포함)
     */
    public DepartmentResponse getDepartmentDetail(Long id) {
        DepartmentResponse dept = organizationMapper.findDepartmentById(id);
        if (dept == null) {
            return null;
        }
        dept.setMemberCount(organizationMapper.countMembersByDepartment(id));
        return dept;
    }

    /**
     * 부서원 목록 조회
     */
    public List<EmployeeResponse> getEmployeesByDepartment(Long departmentId) {
        return organizationMapper.findEmployeesByDepartment(departmentId);
    }

    /**
     * 전체 직원 목록 조회 (검색 지원)
     */
    public List<EmployeeResponse> getAllEmployees(String search) {
        return organizationMapper.findAllEmployees(search);
    }

    /**
     * 직원 상세 조회
     */
    public EmployeeResponse getEmployeeById(Long id) {
        return organizationMapper.findEmployeeById(id);
    }

    /**
     * 직급 목록 조회
     */
    public List<PositionResponse> getAllPositions() {
        return organizationMapper.findAllPositions();
    }

    /**
     * 조직도 트리 구조 응답 생성
     */
    public OrgTreeResponse getOrgTree() {
        List<DepartmentResponse> tree = getAllDepartments();
        List<EmployeeResponse> allEmployees = organizationMapper.findAllEmployees(null);

        OrgTreeResponse response = new OrgTreeResponse();
        response.setDepartments(tree);
        response.setTotalEmployeeCount(allEmployees.size());
        response.setTotalDepartmentCount(countAllDepts(tree));
        return response;
    }

    /**
     * 평탄한 부서 목록을 트리 구조로 변환
     */
    private List<DepartmentResponse> buildTree(List<DepartmentResponse> allDepts) {
        Map<Long, DepartmentResponse> deptMap = allDepts.stream()
                .collect(Collectors.toMap(DepartmentResponse::getId, d -> d));

        List<DepartmentResponse> roots = new ArrayList<>();

        for (DepartmentResponse dept : allDepts) {
            dept.setChildren(new ArrayList<>());
            if (dept.getParentId() == null) {
                roots.add(dept);
            } else {
                DepartmentResponse parent = deptMap.get(dept.getParentId());
                if (parent != null) {
                    parent.getChildren().add(dept);
                } else {
                    roots.add(dept);
                }
            }
        }

        return roots;
    }

    private int countAllDepts(List<DepartmentResponse> depts) {
        int count = 0;
        for (DepartmentResponse dept : depts) {
            count++;
            if (dept.getChildren() != null) {
                count += countAllDepts(dept.getChildren());
            }
        }
        return count;
    }
}
