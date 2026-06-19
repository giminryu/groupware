package com.groupware.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ApprovalDocument {
    private Long id;
    private Long templateId;
    private String documentType;
    private String title;
    private String content;
    private String formData;
    private String status; // DRAFT, SUBMITTED, APPROVED, REJECTED
    private Long applicantId;
    private LocalDateTime createdAt;
    private LocalDateTime submittedAt;
    private LocalDateTime completedAt;
    private String rejectionReason;
    // JOIN
    private String applicantName;
    private String templateName;
    private List<ApprovalLine> approvalLines;
    private int totalLines;
    private int approvedLines;
}
