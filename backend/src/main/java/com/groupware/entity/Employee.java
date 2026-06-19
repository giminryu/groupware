package com.groupware.entity;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 직원(사용자 확장 프로필) 엔티티
 * gw_user_profiles + itsm_users 조인 결과와 매핑
 */
@Data
public class Employee {

    private Long id;
    private Long userId;
    private String username;
    private String name;
    private String email;
    private String phone;
    private Long departmentId;
    private String department;
    private Long positionId;
    private String position;
    private String role;
    private String profileImagePath;
    private LocalDate joinedDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
