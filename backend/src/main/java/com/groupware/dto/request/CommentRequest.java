package com.groupware.dto.request;

import lombok.Data;

@Data
public class CommentRequest {
    private Long parentId;
    private String content;
}
