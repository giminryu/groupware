package com.groupware.dto.request;

import lombok.Data;

@Data
public class FileUpdateRequest {
    private String name;
    private String visibility;
    private Long departmentId;
}
