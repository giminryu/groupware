import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import approvalService from '../../services/approvalService';
import Modal from '../../components/common/Modal';

const MOCK_DOCUMENT = {
  id: 1,
  title: '6월 워크숍 지출 결의',
  documentType: 'EXPENSE',
  status: 'SUBMITTED',
  applicantName: '김철수',
  applicantId: 2,
  createdAt: '2024-06-18T09:00:00',
  formData: {
    purpose: '팀 워크숍 운영 비용',
    amount: '500,000원',
    date: '2024-06-25',
    details: '식대 200,000원 + 교통비 150,000원 + 기타 150,000원',
  },
  approvalLines: [
    { id: 1, approverName: '김부장', approverDepartment: '개발팀', status: 'APPROVED', comment: '확인했습니다', approvedAt: '2024-06-18T14:30:00', order: 1 },
    { id: 2, approverName: '이과장', approverDepartment: '개발팀', status: 'PENDING', comment: null, approvedAt: null, order: 2 },
    { id: 3, approverName: '박팀장', approverDepartment: '경영지원팀', status: 'PENDING', comment: null, approvedAt: null, order: 3 },
  ],
  history: [
    { id: 1, action: 'SUBMITTED', actorName: '김철수', createdAt: '2024-06-18T09:00:00', comment: '결재 요청드립니다.' },
    { id: 2, action: 'APPROVED', actorName: '김부장', createdAt: '2024-06-18T14:30:00', comment: '확인했습니다' },
  ],
};

const STATUS_CONFIG = {
  DRAFT: { label: '임시저장', bg: '#f1f5f9', color: '#64748b' },
  SUBMITTED: { label: '결재중', bg: '#dbeafe', color: '#1d4ed8' },
  APPROVED: { label: '승인완료', bg: '#dcfce7', color: '#16a34a' },
  REJECTED: { label: '반려', bg: '#fee2e2', color: '#dc2626' },
};

const DOC_TYPE_LABELS = {
  EXPENSE: '지출결의서',
  VACATION: '휴가신청서',
  REPORT: '업무보고서',
  GENERAL: '일반결재',
};

const FORM_DATA_LABELS = {
  purpose: '목적',
  amount: '금액',
  date: '날짜',
  details: '상세내역',
  reason: '사유',
  startDate: '시작일',
  endDate: '종료일',
  content: '내용',
};

function formatDateTime(str) {
  if (!str) return '-';
  const d = new Date(str);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const styles = {
  page: { maxWidth: '860px' },
  backBtn: {
    background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
    fontSize: '0.875rem', padding: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '4px',
  },
  card: {
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '16px', overflow: 'hidden',
  },
  cardHeader: { padding: '20px 24px', borderBottom: '1px solid #f1f5f9' },
  cardBody: { padding: '20px 24px' },
  docTitle: { fontSize: '1.3rem', fontWeight: 800, color: '#1e293b', marginBottom: '12px' },
  metaRow: { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  metaItem: { display: 'flex', gap: '6px', alignItems: 'center', fontSize: '0.875rem', color: '#64748b' },
  metaLabel: { fontWeight: 600, color: '#475569' },
  sectionTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.4px' },
  lineRow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0' },
  lineCard: (status) => ({
    padding: '12px 18px',
    borderRadius: '8px',
    background: status === 'APPROVED' ? '#dcfce7' : status === 'REJECTED' ? '#fee2e2' : '#f1f5f9',
    border: `2px solid ${status === 'APPROVED' ? '#16a34a' : status === 'REJECTED' ? '#dc2626' : '#cbd5e1'}`,
    minWidth: '120px',
    textAlign: 'center',
  }),
  lineArrow: { margin: '0 8px', color: '#94a3b8', fontSize: '1.1rem' },
  formRow: { display: 'grid', gridTemplateColumns: '140px 1fr', gap: '2px', marginBottom: '12px', alignItems: 'start' },
  formLabel: { fontSize: '0.875rem', fontWeight: 600, color: '#64748b', paddingTop: '2px' },
  formValue: { fontSize: '0.875rem', color: '#334155' },
  historyItem: {
    display: 'flex', gap: '12px', alignItems: 'flex-start',
    padding: '12px 0', borderBottom: '1px solid #f8fafc',
  },
  historyDot: (action) => ({
    width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, marginTop: '4px',
    background: action === 'APPROVED' ? '#16a34a' : action === 'REJECTED' ? '#dc2626' : '#94a3b8',
  }),
  actionRow: { display: 'flex', gap: '10px', marginTop: '20px' },
  btn: (variant) => ({
    padding: '10px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontSize: '0.875rem', fontWeight: 600,
    background: variant === 'primary' ? '#0f766e' : variant === 'danger' ? '#dc2626' : variant === 'warning' ? '#d97706' : '#f1f5f9',
    color: variant === 'default' ? '#475569' : '#fff',
  }),
  textarea: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '10px 14px', fontSize: '0.875rem', resize: 'vertical',
    minHeight: '80px', outline: 'none', boxSizing: 'border-box', color: '#1e293b',
  },
};

function ApprovalDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject'
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchDoc = useCallback(async () => {
    setLoading(true);
    try {
      const result = await approvalService.getDocument(id);
      setDoc(result?.data || result);
    } catch {
      setDoc({ ...MOCK_DOCUMENT, id: Number(id) });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchDoc(); }, [fetchDoc]);

  const handleSubmit = async () => {
    try {
      await approvalService.submit(id);
      alert('상신되었습니다.');
      fetchDoc();
    } catch {
      alert('상신에 실패했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('삭제하시겠습니까?')) return;
    try {
      await approvalService.delete(id);
      navigate('/approval');
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await approvalService.approve(id, { comment });
      alert('승인되었습니다.');
      setModalType(null);
      setComment('');
      fetchDoc();
    } catch {
      alert('승인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) { alert('반려 의견을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      await approvalService.reject(id, { comment });
      alert('반려되었습니다.');
      setModalType(null);
      setComment('');
      fetchDoc();
    } catch {
      alert('반려에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>로딩 중...</div>;
  if (!doc) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>문서를 찾을 수 없습니다.</div>;

  const statusCfg = STATUS_CONFIG[doc.status] || STATUS_CONFIG.DRAFT;
  const isApplicant = user?.id === doc.applicantId || doc.applicantName === '나';
  const isDraft = doc.status === 'DRAFT';
  // 내 차례인 결재자인지 확인 (단순화: 가장 첫 PENDING 결재자)
  const myTurnLine = doc.approvalLines?.find(l => l.status === 'PENDING');
  const isMyTurn = myTurnLine && (myTurnLine.approverId === user?.id || myTurnLine.approverName === user?.name);

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/approval')}>
        ← 결재함으로 돌아가기
      </button>

      {/* 문서 헤더 */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.docTitle}>{doc.title}</div>
          <div style={styles.metaRow}>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>상태</span>
              <span style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
                background: statusCfg.bg, color: statusCfg.color, fontSize: '0.78rem', fontWeight: 600,
              }}>{statusCfg.label}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>문서유형</span>
              <span>{DOC_TYPE_LABELS[doc.documentType] || doc.documentType}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>기안자</span>
              <span>{doc.applicantName}</span>
            </div>
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>기안일</span>
              <span>{formatDateTime(doc.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 결재선 */}
      {doc.approvalLines?.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <div style={styles.sectionTitle}>결재선</div>
            <div style={styles.lineRow}>
              {doc.approvalLines.map((line, idx) => (
                <div key={line.id} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={styles.lineCard(line.status)}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{line.approverName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', margin: '2px 0' }}>{line.approverDepartment}</div>
                    <div style={{ fontSize: '12px' }}>
                      {line.status === 'APPROVED' ? '✅ 승인' : line.status === 'REJECTED' ? '❌ 반려' : '⏳ 대기'}
                    </div>
                    {line.approvedAt && (
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{formatDateTime(line.approvedAt)}</div>
                    )}
                  </div>
                  {idx < doc.approvalLines.length - 1 && (
                    <span style={styles.lineArrow}>→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 문서 내용 */}
      {doc.formData && Object.keys(doc.formData).length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <div style={styles.sectionTitle}>문서 내용</div>
            {Object.entries(doc.formData).map(([key, value]) => (
              <div key={key} style={styles.formRow}>
                <div style={styles.formLabel}>{FORM_DATA_LABELS[key] || key}</div>
                <div style={styles.formValue}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 결재 이력 */}
      {doc.history?.length > 0 && (
        <div style={styles.card}>
          <div style={styles.cardBody}>
            <div style={styles.sectionTitle}>결재 이력</div>
            {doc.history.map((h) => (
              <div key={h.id} style={styles.historyItem}>
                <div style={styles.historyDot(h.action)} />
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#334155', fontWeight: 500 }}>
                    {formatDateTime(h.createdAt)} · {h.actorName} · {h.action === 'APPROVED' ? '승인' : h.action === 'REJECTED' ? '반려' : h.action === 'SUBMITTED' ? '상신' : h.action}
                  </span>
                  {h.comment && (
                    <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>"{h.comment}"</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      <div style={styles.actionRow}>
        {isApplicant && isDraft && (
          <>
            <button style={styles.btn('primary')} onClick={handleSubmit}>상신하기</button>
            <button
              style={styles.btn('default')}
              onClick={() => navigate(`/approval/create?edit=${id}`)}
            >수정</button>
            <button style={styles.btn('danger')} onClick={handleDelete}>삭제</button>
          </>
        )}
        {isMyTurn && (
          <>
            <button style={styles.btn('primary')} onClick={() => { setModalType('approve'); setComment(''); }}>승인</button>
            <button style={styles.btn('danger')} onClick={() => { setModalType('reject'); setComment(''); }}>반려</button>
          </>
        )}
      </div>

      {/* 승인/반려 모달 */}
      <Modal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={modalType === 'approve' ? '✅ 승인 의견' : '❌ 반려 의견'}
        maxWidth="440px"
      >
        <div>
          <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '12px' }}>
            {modalType === 'approve' ? '승인 의견을 입력해주세요. (선택)' : '반려 사유를 입력해주세요. (필수)'}
          </p>
          <textarea
            style={styles.textarea}
            placeholder={modalType === 'approve' ? '승인 의견 (선택사항)' : '반려 사유를 입력하세요'}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button
              style={styles.btn('default')}
              onClick={() => setModalType(null)}
            >취소</button>
            <button
              style={styles.btn(modalType === 'approve' ? 'primary' : 'danger')}
              onClick={modalType === 'approve' ? handleApprove : handleReject}
              disabled={submitting}
            >
              {submitting ? '처리 중...' : modalType === 'approve' ? '승인' : '반려'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default ApprovalDetailPage;
