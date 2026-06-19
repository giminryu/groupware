package com.groupware.mapper;

import com.groupware.entity.ApprovalDocument;
import com.groupware.entity.ApprovalLine;
import com.groupware.entity.ApprovalTemplate;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ApprovalMapper {

    // 템플릿
    List<ApprovalTemplate> findAllTemplates();
    ApprovalTemplate findTemplateById(@Param("id") Long id);

    // 문서
    List<ApprovalDocument> findDocuments(@Param("userId") Long userId,
                                          @Param("status") String status,
                                          @Param("type") String type);
    ApprovalDocument findDocumentById(@Param("id") Long id);
    void insertDocument(ApprovalDocument document);
    void updateDocumentStatus(@Param("id") Long id,
                              @Param("status") String status,
                              @Param("submittedAt") java.time.LocalDateTime submittedAt,
                              @Param("completedAt") java.time.LocalDateTime completedAt,
                              @Param("rejectionReason") String rejectionReason);
    void deleteDocument(@Param("id") Long id);

    // 결재선
    List<ApprovalLine> findLinesByDocumentId(@Param("documentId") Long documentId);
    ApprovalLine findLineById(@Param("id") Long id);
    ApprovalLine findCurrentPendingLine(@Param("documentId") Long documentId, @Param("approverId") Long approverId);
    ApprovalLine findNextLine(@Param("documentId") Long documentId, @Param("sequence") int sequence);
    void insertLine(ApprovalLine line);
    void updateLineStatus(@Param("id") Long id,
                          @Param("status") String status,
                          @Param("comment") String comment,
                          @Param("approvedAt") java.time.LocalDateTime approvedAt);
    int countLines(@Param("documentId") Long documentId);
    int countApprovedLines(@Param("documentId") Long documentId);

    // 내가 결재해야 할 목록
    List<ApprovalDocument> findPendingForApprover(@Param("approverId") Long approverId);

    // 이력
    void insertHistory(@Param("documentId") Long documentId,
                       @Param("action") String action,
                       @Param("actorId") Long actorId,
                       @Param("comment") String comment);
}
