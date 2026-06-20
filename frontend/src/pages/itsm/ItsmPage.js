import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

/* ITSM 전용 axios 인스턴스 */
const itsmApi = axios.create({
  baseURL: '/itsm-api',
  timeout: 5000,
});

const MOCK_REQUESTS = [
  { id: 1, title: '노트북 RAM 업그레이드 요청', requestType: 'NORMAL', status: 'IN_PROGRESS', createdAt: '2024-06-18', description: '현재 8GB에서 16GB로 업그레이드 요청' },
  { id: 2, title: '사무실 프린터 고장', requestType: 'URGENT', status: 'PENDING', createdAt: '2024-06-19', description: '3층 프린터 용지 걸림 및 오류 발생' },
  { id: 3, title: 'VPN 접속 문제', requestType: 'NORMAL', status: 'COMPLETED', createdAt: '2024-06-15', description: '재택근무 중 VPN 연결 불가' },
  { id: 4, title: '모니터 추가 요청', requestType: 'NORMAL', status: 'REJECTED', createdAt: '2024-06-10', description: '듀얼 모니터 환경 구성 요청' },
];

const STATUS_MAP = {
  PENDING:     { label: '접수',   color: '#f59e0b', bg: '#fef3c7' },
  IN_PROGRESS: { label: '처리중', color: '#3b82f6', bg: '#eff6ff' },
  COMPLETED:   { label: '완료',   color: '#10b981', bg: '#ecfdf5' },
  REJECTED:    { label: '거부',   color: '#ef4444', bg: '#fee2e2' },
};

const TYPE_MAP = {
  NORMAL: { label: '일반', color: '#6366f1', bg: '#eef2ff' },
  URGENT: { label: '긴급', color: '#ef4444', bg: '#fee2e2' },
};

const styles = {
  page: { maxWidth: '900px' },
  header: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' },
  title: { fontSize: '1.4rem', fontWeight: 800, color: '#0f766e', marginBottom: '4px' },
  subtitle: { fontSize: '0.875rem', color: '#64748b' },
  newBtn: {
    padding: '10px 20px', background: '#0f766e', color: '#fff', border: 'none',
    borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0,
  },
  card: {
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '12px',
  },
  requestItem: {
    padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', gap: '16px',
  },
  requestInfo: { flex: 1 },
  requestTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' },
  requestDesc: { fontSize: '0.8rem', color: '#64748b', marginBottom: '6px' },
  requestMeta: { fontSize: '0.75rem', color: '#94a3b8' },
  badge: {
    padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
  },
  emptyState: {
    padding: '60px 20px', textAlign: 'center', color: '#94a3b8',
  },
  emptyIcon: { fontSize: '2.5rem', marginBottom: '12px' },
  /* 모달 */
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: '12px', padding: '28px', width: '500px',
    maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#0f766e', marginBottom: '20px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' },
  input: {
    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
    borderRadius: '7px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
    borderRadius: '7px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
    minHeight: '90px', resize: 'vertical',
  },
  select: {
    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
    borderRadius: '7px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
    background: '#fff',
  },
  modalFooter: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },
  cancelBtn: {
    padding: '9px 18px', background: '#f1f5f9', border: 'none',
    borderRadius: '7px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600,
  },
  submitBtn: {
    padding: '9px 18px', background: '#0f766e', color: '#fff', border: 'none',
    borderRadius: '7px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600,
  },
  apiNote: {
    padding: '10px 16px', background: '#fef3c7', borderRadius: '8px',
    fontSize: '0.78rem', color: '#92400e', marginBottom: '16px',
    border: '1px solid #fde68a',
  },
  toast: {
    position: 'fixed', bottom: '24px', right: '24px',
    background: '#0f766e', color: '#fff', padding: '12px 20px',
    borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 9999,
  },
};

function ItsmPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', requestType: 'NORMAL' });
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2800);
  };

  const loadRequests = () => {
    setLoading(true);
    itsmApi.get('/service-requests')
      .then(r => {
        const data = Array.isArray(r.data) ? r.data : (r.data?.content || r.data?.data || []);
        setRequests(data.length ? data : MOCK_REQUESTS);
        setUseMock(!data.length);
      })
      .catch(() => {
        setRequests(MOCK_REQUESTS);
        setUseMock(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRequests(); }, []);

  const handleSubmit = async () => {
    if (!form.title.trim()) { showToast('제목을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        requesterId: user?.id,
        requesterName: user?.name || user?.username,
      };
      const r = await itsmApi.post('/service-requests', payload);
      const newReq = r.data?.data || r.data;
      setRequests(prev => [newReq, ...prev]);
      showToast('서비스 요청이 등록되었습니다.');
    } catch {
      /* API 실패 시 mock으로 추가 */
      const mockNew = {
        id: Date.now(),
        title: form.title,
        description: form.description,
        requestType: form.requestType,
        status: 'PENDING',
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setRequests(prev => [mockNew, ...prev]);
      showToast('서비스 요청이 등록되었습니다. (로컬 반영)');
    } finally {
      setSubmitting(false);
      setShowForm(false);
      setForm({ title: '', description: '', requestType: 'NORMAL' });
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.title}>🎫 ITSM 서비스 요청</div>
          <div style={styles.subtitle}>IT 서비스 요청 및 처리 현황을 확인합니다.</div>
        </div>
        <button style={styles.newBtn} onClick={() => setShowForm(true)}>+ 새 서비스 요청</button>
      </div>

      {useMock && (
        <div style={styles.apiNote}>
          ITSM API(포트 8082)에 연결할 수 없어 샘플 데이터를 표시합니다.
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px' }}>불러오는 중...</div>
      ) : requests.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🎫</div>
          <div style={{ fontWeight: 700, color: '#475569', marginBottom: '6px' }}>등록된 서비스 요청이 없습니다</div>
          <div style={{ fontSize: '0.85rem' }}>새 서비스 요청 버튼을 눌러 요청하세요.</div>
        </div>
      ) : (
        <div style={styles.card}>
          {requests.map((req) => {
            const st = STATUS_MAP[req.status] || STATUS_MAP.PENDING;
            const tp = TYPE_MAP[req.requestType] || TYPE_MAP.NORMAL;
            return (
              <div key={req.id} style={styles.requestItem}>
                <div style={styles.requestInfo}>
                  <div style={styles.requestTitle}>{req.title}</div>
                  {req.description && <div style={styles.requestDesc}>{req.description}</div>}
                  <div style={styles.requestMeta}>요청일: {req.createdAt}</div>
                </div>
                <span style={{ ...styles.badge, color: tp.color, background: tp.bg }}>
                  {tp.label}
                </span>
                <span style={{ ...styles.badge, color: st.color, background: st.bg }}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 새 요청 모달 */}
      {showForm && (
        <div style={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>새 서비스 요청</div>
            <div style={styles.formGroup}>
              <label style={styles.label}>요청 유형</label>
              <select style={styles.select} value={form.requestType}
                onChange={(e) => setForm(f => ({ ...f, requestType: e.target.value }))}>
                <option value="NORMAL">일반</option>
                <option value="URGENT">긴급</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>제목 *</label>
              <input style={styles.input} value={form.title}
                onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="요청 제목을 입력하세요" />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>상세 설명</label>
              <textarea style={styles.textarea} value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="문제 상황이나 요청 내용을 자세히 설명해주세요" />
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setShowForm(false)}>취소</button>
              <button style={styles.submitBtn} onClick={handleSubmit} disabled={submitting}>
                {submitting ? '등록 중...' : '요청 등록'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMsg && <div style={styles.toast}>{toastMsg}</div>}
    </div>
  );
}

export default ItsmPage;
