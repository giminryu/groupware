package com.groupware.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class Post {
    private Long id;
    private Long boardId;
    private String title;
    private String content;
    private Long authorId;
    private Integer viewCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // JOIN 필드
    private String authorName;
    private String boardName;
    private Integer commentCount;
}
