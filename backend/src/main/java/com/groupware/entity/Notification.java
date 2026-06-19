package com.groupware.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class Notification {
    private Long id;
    private Long userId;
    private String type;
    private String title;
    private String message;
    private Long relatedId;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
