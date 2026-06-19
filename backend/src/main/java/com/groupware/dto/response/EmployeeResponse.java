package com.groupware.dto.response;

import lombok.Data;

import java.time.LocalDate;

/**
 * 직원 응답 DTO
 */
@Data
public class EmployeeResponse {

    private Long id;
    private Long userId;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String department;
    private String position;
    private String role;
    private String profileImagePath;
    private LocalDate joinedDate;
}
