package com.groupware.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ApprovalLine {
    private Long id;
    private Long documentId;
    private Long approverId;
    private int sequence;
    private String status; // PENDING, APPROVED, REJECTED
    private LocalDateTime approvedAt;
    private String comment;
    private Long delegatedTo;
    private LocalDateTime createdAt;
    // JOIN
    private String approverName;
    private String approverDepartment;
    private String delegatedToName;
}
