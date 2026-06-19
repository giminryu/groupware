package com.groupware.dto.response;

import lombok.Data;

import java.util.List;

/**
 * 부서 응답 DTO (트리 구조 지원)
 */
@Data
public class DepartmentResponse {

    private Long id;
    private String name;
    private Long parentId;
    private String managerName;
    private String contact;
    private String location;
    private int sortOrder;
    private List<DepartmentResponse> children;
    private int memberCount;
}
