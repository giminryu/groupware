package com.groupware.dto.response;

import lombok.Data;

import java.util.List;

/**
 * 조직도 트리 응답 DTO
 */
@Data
public class OrgTreeResponse {

    private List<DepartmentResponse> departments;
    private int totalEmployeeCount;
    private int totalDepartmentCount;
}
