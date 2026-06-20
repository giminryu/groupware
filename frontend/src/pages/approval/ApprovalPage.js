import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import approvalService from '../../services/approvalService';

const MOCK_PENDING = [
  { id: 1, title: '6월 워크숍 지출 결의', applicantName: '김철수', documentType: 'EXPENSE', status: 'SUBMITTED', createdAt: '2024-06-18', progress: '1/3' },
  { id: 2, title: '연차 휴가 신청', applicantName: '이영희', documentType: 'VACATION', status: 'SUBMITTED', createdAt: '2024-06-17', progress: '1/2' },
];

const MOCK_SENT = [
  { id: 3, title: '7월 팀 교육 계획 보고', applicantName: '나', documentType: 'REPORT', status: 'APPROVED', createdAt: '2024-06-15', progress: '3/3' },
  { id: 4, title: '사무용품 구매 결의', applicantName: '나', documentType: 'EXPENSE', status: 'REJECTED', createdAt: '2024-06-14', progress: '1/2' },
];

const MOCK_DRAFT = [
  { id: 5, title: '출장비 정산 신청', applicantName: '나', documentType: 'EXPENSE', status: 'DRAFT', createdAt: '2024-06-13', progress: '0/2' },
];

const DOC_TYPE_LABELS = {
  EXPENSE: '지출결의',
  VACATION: '휴가신청',
  REPORT: '업무보고',
  GENERAL: '일반결재',
};

const STATUS_CONFIG = {
  DRAFT: { label: '임시저장', bg: '#f1f5f9', color: '#64748b' },
  SUBMITTED: { label: '결재중', bg: '#dbeafe', color: '#1d4ed8' },
  APPROVED: { label: '승인', bg: '#dcfce7', color: '#16a34a' },
  REJECTED: { label: '반려', bg: '#fee2e2', color: '#dc2626' },
};

const styles = {
  page: { width: '100%' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  title: { fontSize: '1.4rem', fontWeight: 800, color: '#0f766e' },
  createBtn: {
    background: '#0f766e', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '9px 20px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
  },
  tabRow: { display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '0' },
  tab: {
    padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '0.9rem', fontWeight: 500, color: '#64748b', borderBottom: '2px solid transparent',
    marginBottom: '-2px', transition: 'all 0.15s',
  },
  tabActive: { color: '#0f766e', fontWeight: 700, borderBottomColor: '#0f766e' },
  table: {
    width: '100%', borderCollapse: 'collapse', background: '#fff',
    borderRadius: '12px', overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
  },
  th: {
    background: '#f8fafc', padding: '12px 16px', textAlign: 'left',
    fontSize: '0.78rem', fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.4px', borderBottom: '1px solid #e2e8f0',
  },
  td: { padding: '14px 16px', fontSize: '0.875rem', color: '#334155', borderBottom: '1px solid #f1f5f9' },
  emptyText: { padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: '12px',
      background: cfg.bg, color: cfg.color, fontSize: '0.78rem', fontWeight: 600,
    }}>
      {cfg.label}
    </span>
  );
}

function ApprovalPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('inbox');
  const [inboxDocs, setInboxDocs] = useState([]);
  const [sentDocs, setSentDocs] = useState([]);
  const [draftDocs, setDraftDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pending, sent, draft] = await Promise.all([
        approvalService.getPending(),
        approvalService.getDocuments({ type: 'sent' }),
        approvalService.getDocuments({ status: 'DRAFT' }),
      ]);
      setInboxDocs(Array.isArray(pending) ? pending : (pending?.content || MOCK_PENDING));
      setSentDocs(Array.isArray(sent) ? sent : (sent?.content || MOCK_SENT));
      setDraftDocs(Array.isArray(draft) ? draft : (draft?.content || MOCK_DRAFT));
    } catch {
      setInboxDocs(MOCK_PENDING);
      setSentDocs(MOCK_SENT);
      setDraftDocs(MOCK_DRAFT);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const TABS = [
    { key: 'inbox', label: `결재 수신함 (${inboxDocs.length})` },
    { key: 'sent', label: `결재 발신함 (${sentDocs.length})` },
    { key: 'draft', label: `임시저장 (${draftDocs.length})` },
  ];

  const currentDocs = activeTab === 'inbox' ? inboxDocs : activeTab === 'sent' ? sentDocs : draftDocs;

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>✅ 전자결재</div>
        <button
          style={styles.createBtn}
          onClick={() => navigate('/approval/create')}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#0d6b63'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#0f766e'; }}
        >
          + 결재 문서 작성
        </button>
      </div>

      {/* 탭 */}
      <div style={styles.tabRow}>
        {TABS.map(t => (
          <button
            key={t.key}
            style={{ ...styles.tab, ...(activeTab === t.key ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>로딩 중...</div>
      ) : currentDocs.length === 0 ? (
        <div style={styles.emptyText}>문서가 없습니다.</div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '12px' }}>
          <table style={{ ...styles.table, minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={styles.th}>문서번호</th>
                <th style={styles.th}>제목</th>
                <th style={styles.th}>기안자</th>
                <th style={styles.th}>문서유형</th>
                <th style={styles.th}>상태</th>
                <th style={styles.th}>기안일</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>진행상황</th>
              </tr>
            </thead>
            <tbody>
              {currentDocs.map((doc) => (
                <tr
                  key={doc.id}
                  style={{ cursor: 'pointer', background: hoveredRow === doc.id ? '#f0fdfa' : '#fff' }}
                  onClick={() => navigate(`/approval/${doc.id}`)}
                  onMouseEnter={() => setHoveredRow(doc.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ ...styles.td, color: '#94a3b8', width: '80px' }}>#{doc.id}</td>
                  <td style={{ ...styles.td, fontWeight: 500 }}>{doc.title}</td>
                  <td style={{ ...styles.td, color: '#64748b' }}>{doc.applicantName}</td>
                  <td style={{ ...styles.td, color: '#64748b' }}>{DOC_TYPE_LABELS[doc.documentType] || doc.documentType}</td>
                  <td style={styles.td}><StatusBadge status={doc.status} /></td>
                  <td style={{ ...styles.td, color: '#64748b', whiteSpace: 'nowrap' }}>{doc.createdAt?.slice(0, 10)}</td>
                  <td style={{ ...styles.td, textAlign: 'center', color: '#64748b' }}>{doc.progress || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ApprovalPage;
