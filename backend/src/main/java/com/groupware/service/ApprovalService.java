package com.groupware.service;

import com.groupware.entity.ApprovalDocument;
import com.groupware.entity.ApprovalLine;
import com.groupware.entity.ApprovalTemplate;
import com.groupware.mapper.ApprovalMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalMapper approvalMapper;
    private final NotificationService notificationService;

    // 템플릿 목록
    public List<ApprovalTemplate> getTemplates() {
        return approvalMapper.findAllTemplates();
    }

    // 문서 목록
    public List<ApprovalDocument> getDocuments(Long userId, String status, String type) {
        return approvalMapper.findDocuments(userId, status, type);
    }

    // 문서 상세
    public ApprovalDocument getDocument(Long id) {
        ApprovalDocument doc = approvalMapper.findDocumentById(id);
        if (doc == null) return null;
        List<ApprovalLine> lines = approvalMapper.findLinesByDocumentId(id);
        doc.setApprovalLines(lines);
        return doc;
    }

    // 문서 작성
    @Transactional
    public ApprovalDocument createDocument(Map<String, Object> body, Long applicantId) {
        ApprovalDocument doc = new ApprovalDocument();
        doc.setTemplateId(body.get("templateId") != null ? Long.valueOf(body.get("templateId").toString()) : null);
        doc.setDocumentType(body.getOrDefault("documentType", "CUSTOM").toString());
        doc.setTitle(body.get("title").toString());
        doc.setContent(body.get("content").toString());
        doc.setFormData(body.get("formData") != null ? body.get("formData").toString() : "{}");
        doc.setStatus("DRAFT");
        doc.setApplicantId(applicantId);
        approvalMapper.insertDocument(doc);

        // 결재선 등록
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> approvers = (List<Map<String, Object>>) body.get("approvers");
        if (approvers != null) {
            for (int i = 0; i < approvers.size(); i++) {
                Map<String, Object> approver = approvers.get(i);
                ApprovalLine line = new ApprovalLine();
                line.setDocumentId(doc.getId());
                line.setApproverId(Long.valueOf(approver.get("userId").toString()));
                line.setSequence(i + 1);
                approvalMapper.insertLine(line);
            }
        }

        approvalMapper.insertHistory(doc.getId(), "CREATE", applicantId, null);
        return getDocument(doc.getId());
    }

    // 결재 상신
    @Transactional
    public ApprovalDocument submitDocument(Long documentId, Long applicantId) {
        ApprovalDocument doc = approvalMapper.findDocumentById(documentId);
        if (doc == null || !doc.getApplicantId().equals(applicantId)) {
            throw new IllegalArgumentException("문서를 찾을 수 없거나 권한이 없습니다");
        }
        if (!"DRAFT".equals(doc.getStatus())) {
            throw new IllegalArgumentException("임시저장 상태인 문서만 상신할 수 있습니다");
        }

        approvalMapper.updateDocumentStatus(documentId, "SUBMITTED", LocalDateTime.now(), null, null);
        approvalMapper.insertHistory(documentId, "SUBMIT", applicantId, null);

        // 첫 번째 결재자에게 알림
        List<ApprovalLine> lines = approvalMapper.findLinesByDocumentId(documentId);
        if (!lines.isEmpty()) {
            ApprovalLine firstLine = lines.get(0);
            notificationService.sendNotification(
                firstLine.getApproverId(),
                "APPROVAL_REQUEST",
                "결재 요청",
                doc.getTitle() + " 결재를 요청했습니다",
                documentId
            );
        }

        return getDocument(documentId);
    }

    // 결재 승인
    @Transactional
    public ApprovalDocument approveDocument(Long documentId, Long approverId, String comment) {
        ApprovalDocument doc = approvalMapper.findDocumentById(documentId);
        if (doc == null) throw new IllegalArgumentException("문서를 찾을 수 없습니다");
        if (!"SUBMITTED".equals(doc.getStatus())) throw new IllegalArgumentException("상신된 문서만 결재할 수 있습니다");

        ApprovalLine currentLine = approvalMapper.findCurrentPendingLine(documentId, approverId);
        if (currentLine == null) throw new IllegalArgumentException("결재 권한이 없거나 이미 처리된 결재입니다");

        // 현재 결재선 승인
        approvalMapper.updateLineStatus(currentLine.getId(), "APPROVED", comment, LocalDateTime.now());
        approvalMapper.insertHistory(documentId, "APPROVE", approverId, comment);

        // 다음 결재자 확인
        ApprovalLine nextLine = approvalMapper.findNextLine(documentId, currentLine.getSequence());

        if (nextLine != null) {
            // 다음 결재자에게 알림
            notificationService.sendNotification(
                nextLine.getApproverId(),
                "APPROVAL_REQUEST",
                "결재 요청",
                doc.getTitle() + " 결재를 요청했습니다",
                documentId
            );
        } else {
            // 모든 결재 완료 확인
            int total = approvalMapper.countLines(documentId);
            int approved = approvalMapper.countApprovedLines(documentId);
            if (total > 0 && total == approved) {
                approvalMapper.updateDocumentStatus(documentId, "APPROVED", null, LocalDateTime.now(), null);
                // 기안자에게 알림
                notificationService.sendNotification(
                    doc.getApplicantId(),
                    "APPROVAL_COMPLETE",
                    "결재 완료",
                    doc.getTitle() + " 결재가 완료되었습니다",
                    documentId
                );
            }
        }

        return getDocument(documentId);
    }

    // 결재 반려
    @Transactional
    public ApprovalDocument rejectDocument(Long documentId, Long approverId, String reason) {
        ApprovalDocument doc = approvalMapper.findDocumentById(documentId);
        if (doc == null) throw new IllegalArgumentException("문서를 찾을 수 없습니다");
        if (!"SUBMITTED".equals(doc.getStatus())) throw new IllegalArgumentException("상신된 문서만 반려할 수 있습니다");

        ApprovalLine currentLine = approvalMapper.findCurrentPendingLine(documentId, approverId);
        if (currentLine == null) throw new IllegalArgumentException("결재 권한이 없거나 이미 처리된 결재입니다");

        // 결재선 반려
        approvalMapper.updateLineStatus(currentLine.getId(), "REJECTED", reason, LocalDateTime.now());

        // 문서 상태 반려
        approvalMapper.updateDocumentStatus(documentId, "REJECTED", null, LocalDateTime.now(), reason);
        approvalMapper.insertHistory(documentId, "REJECT", approverId, reason);

        // 기안자에게 반려 알림
        notificationService.sendNotification(
            doc.getApplicantId(),
            "APPROVAL_REJECTED",
            "결재 반려",
            doc.getTitle() + " 결재가 반려되었습니다. 사유: " + reason,
            documentId
        );

        return getDocument(documentId);
    }

    // 문서 삭제 (DRAFT만)
    @Transactional
    public boolean deleteDocument(Long documentId, Long applicantId) {
        ApprovalDocument doc = approvalMapper.findDocumentById(documentId);
        if (doc == null || !doc.getApplicantId().equals(applicantId)) return false;
        if (!"DRAFT".equals(doc.getStatus())) return false;
        approvalMapper.deleteDocument(documentId);
        return true;
    }

    // 내가 결재해야 할 목록
    public List<ApprovalDocument> getPendingDocuments(Long approverId) {
        return approvalMapper.findPendingForApprover(approverId);
    }
}
