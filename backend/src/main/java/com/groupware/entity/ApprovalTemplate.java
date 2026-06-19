package com.groupware.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ApprovalTemplate {
    private Long id;
    private String name;
    private String documentType;
    private String formFields;
    private LocalDateTime createdAt;
}
