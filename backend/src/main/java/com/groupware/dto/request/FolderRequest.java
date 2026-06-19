package com.groupware.dto.request;

import lombok.Data;

@Data
public class FolderRequest {
    private String name;
    private Long parentId;
    private Long departmentId;
    private String visibility = "PRIVATE";
}
