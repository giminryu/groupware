package com.groupware.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Board {
    private Long id;
    private String name;
    private Long departmentId;
    private String description;
    private LocalDateTime createdAt;
}
