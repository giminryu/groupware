package com.groupware.entity;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * ITSM 사용자 엔티티 (읽기 전용)
 * itsm_users 테이블과 매핑 - 수정 금지
 */
@Data
public class ItsmUser {

    private Long id;
    private String username;
    private String passwordHash;
    private String name;
    private String email;
    private String role;
    private String department;
    private boolean active;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
