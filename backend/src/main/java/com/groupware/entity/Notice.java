package com.groupware.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Notice {
    private Long id;
    private String title;
    private String content;
    private Long authorId;
    private String visibility;
    private Boolean viewRequired;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // JOIN 필드
    private String authorName;
    private Boolean isViewed;
}
