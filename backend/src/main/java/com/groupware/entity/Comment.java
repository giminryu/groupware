package com.groupware.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class Comment {
    private Long id;
    private Long postId;
    private Long parentId;
    private Long authorId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // JOIN 필드
    private String authorName;
    private List<Comment> children;
}
