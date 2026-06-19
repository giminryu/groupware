package com.groupware.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class FileInfo {
    private Long id;
    private String name;
    private Long parentId;
    private Long ownerId;
    private String fileType;
    private Long size;
    private String mimeType;
    private String storagePath;
    private String visibility;
    private Long departmentId;
    private Boolean isDeleted;
    private LocalDateTime deletedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // JOIN 필드
    private String ownerName;
    private String departmentName;
}
