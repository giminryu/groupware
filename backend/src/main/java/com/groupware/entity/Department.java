package com.groupware.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 부서 엔티티
 * gw_departments 테이블과 매핑
 */
@Data
public class Department {

    private Long id;
    private String name;
    private Long parentId;
    private Long managerId;
    private String contact;
    private String location;
    private int sortOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
