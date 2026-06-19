package com.groupware.mapper;

import com.groupware.dto.response.DepartmentResponse;
import com.groupware.dto.response.EmployeeResponse;
import com.groupware.dto.response.PositionResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

/**
 * 조직도 매퍼
 * 부서, 직원, 직급 조회
 */
@Mapper
public interface OrganizationMapper {

    List<DepartmentResponse> findAllDepartments();

    DepartmentResponse findDepartmentById(@Param("id") Long id);

    List<EmployeeResponse> findEmployeesByDepartment(@Param("departmentId") Long departmentId);

    List<EmployeeResponse> findAllEmployees(@Param("search") String search);

    EmployeeResponse findEmployeeById(@Param("id") Long id);

    List<PositionResponse> findAllPositions();

    int countMembersByDepartment(@Param("departmentId") Long departmentId);
}
