import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import approvalService from '../../services/approvalService';
import api from '../../services/api';

const MOCK_TEMPLATES = [
  {
    id: 1, name: '휴가신청서', documentType: 'VACATION', icon: '🏖️',
    description: '연차, 반차, 병가 등 휴가 신청',
    formFields: [
      { key: 'reason', label: '휴가 사유', type: 'text', required: true },
      { key: 'startDate', label: '시작일', type: 'date', required: true },
      { key: 'endDate', label: '종료일', type: 'date', required: true },
      { key: 'details', label: '상세 내용', type: 'textarea', required: false },
    ],
  },
  {
    id: 2, name: '지출결의서', documentType: 'EXPENSE', icon: '💳',
    description: '업무 관련 비용 지출 결의',
    formFields: [
      { key: 'purpose', label: '지출 목적', type: 'text', required: true },
      { key: 'amount', label: '금액', type: 'text', required: true },
      { key: 'date', label: '지출일', type: 'date', required: true },
      { key: 'details', label: '상세 내역', type: 'textarea', required: true },
    ],
  },
  {
    id: 3, name: '업무보고서', documentType: 'REPORT', icon: '📊',
    description: '업무 진행 현황 및 결과 보고',
    formFields: [
      { key: 'purpose', label: '보고 제목', type: 'text', required: true },
      { key: 'content', label: '보고 내용', type: 'textarea', required: true },
      { key: 'details', label: '첨부 사항', type: 'textarea', required: false },
    ],
  },
  {
    id: 4, name: '일반결재', documentType: 'GENERAL', icon: '📋',
    description: '기타 일반 결재 문서',
    formFields: [
      { key: 'purpose', label: '제목', type: 'text', required: true },
      { key: 'content', label: '내용', type: 'textarea', required: true },
    ],
  },
];

const MOCK_EMPLOYEES = [
  { id: 10, name: '김부장', department: '개발팀', position: '부장' },
  { id: 11, name: '이과장', department: '개발팀', position: '과장' },
  { id: 12, name: '박팀장', department: '경영지원팀', position: '팀장' },
  { id: 13, name: '최대리', department: '마케팅팀', position: '대리' },
  { id: 14, name: '정사원', department: '개발팀', position: '사원' },
];

const styles = {
  page: { maxWidth: '820px' },
  backBtn: {
    background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
    fontSize: '0.875rem', padding: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '4px',
  },
  title: { fontSize: '1.4rem', fontWeight: 800, color: '#0f766e', marginBottom: '24px' },
  stepRow: { display: 'flex', gap: '0', marginBottom: '28px' },
  step: (active, done) => ({
    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
    background: done ? '#f0fdfa' : active ? '#0f766e' : '#f8fafc',
    color: done ? '#0f766e' : active ? '#fff' : '#94a3b8',
    fontWeight: active || done ? 700 : 400, fontSize: '0.875rem',
    borderRadius: '0', cursor: 'default',
    borderBottom: active ? '2px solid #0d9488' : done ? '2px solid #99f6e4' : '2px solid #e2e8f0',
  }),
  card: {
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '24px', marginBottom: '16px',
  },
  templateGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  templateCard: (selected) => ({
    border: `2px solid ${selected ? '#0f766e' : '#e2e8f0'}`,
    borderRadius: '10px', padding: '16px', cursor: 'pointer',
    background: selected ? '#f0fdfa' : '#fff',
    transition: 'all 0.15s',
  }),
  templateIcon: { fontSize: '2rem', marginBottom: '8px' },
  templateName: { fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '4px' },
  templateDesc: { fontSize: '0.8rem', color: '#64748b' },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' },
  input: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '9px 14px', fontSize: '0.875rem', outline: 'none',
    boxSizing: 'border-box', color: '#1e293b', marginBottom: '16px',
  },
  textarea: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '9px 14px', fontSize: '0.875rem', resize: 'vertical',
    minHeight: '100px', outline: 'none', boxSizing: 'border-box', color: '#1e293b', marginBottom: '16px',
  },
  searchInput: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '9px 14px', fontSize: '0.875rem', outline: 'none',
    boxSizing: 'border-box', color: '#1e293b',
  },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0,
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 100, maxHeight: '200px', overflowY: 'auto',
  },
  dropdownItem: {
    padding: '10px 14px', cursor: 'pointer', fontSize: '0.875rem',
    borderBottom: '1px solid #f8fafc',
  },
  lineItem: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px',
    background: '#f8fafc', borderRadius: '6px', marginBottom: '6px',
  },
  orderBadge: {
    background: '#0f766e', color: 'white', borderRadius: '50%',
    width: '24px', height: '24px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '12px', flexShrink: 0,
  },
  removeBtn: { color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 },
  btnRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' },
  btn: (variant) => ({
    padding: '10px 22px', borderRadius: '8px', border: 'none', cursor: 'pointer',
    fontSize: '0.875rem', fontWeight: 600,
    background: variant === 'primary' ? '#0f766e' : variant === 'secondary' ? '#f1f5f9' : '#e2e8f0',
    color: variant === 'primary' ? '#fff' : '#475569',
  }),
};

function ApprovalFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1); // 1: 템플릿, 2: 내용, 3: 결재선
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [docTitle, setDocTitle] = useState('');
  const [formData, setFormData] = useState({});
  const [approvalLines, setApprovalLines] = useState([]);
  const [empSearch, setEmpSearch] = useState('');
  const [empResults, setEmpResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    approvalService.getTemplates()
      .then(r => setTemplates(Array.isArray(r) ? r : (r?.data || MOCK_TEMPLATES)))
      .catch(() => setTemplates(MOCK_TEMPLATES));
  }, []);

  const searchEmployees = useCallback(async (q) => {
    if (!q.trim()) { setEmpResults([]); setShowDropdown(false); return; }
    try {
      const result = await api.get('/employees/search', { params: { query: q } });
      const items = result?.data?.content || result?.data || result?.data?.data || [];
      setEmpResults(Array.isArray(items) ? items : MOCK_EMPLOYEES.filter(e => e.name.includes(q)));
    } catch {
      setEmpResults(MOCK_EMPLOYEES.filter(e => e.name.includes(q)));
    }
    setShowDropdown(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchEmployees(empSearch), 300);
    return () => clearTimeout(timer);
  }, [empSearch, searchEmployees]);

  const addApprover = (emp) => {
    if (approvalLines.find(l => l.approverId === emp.id)) return;
    setApprovalLines(prev => [...prev, {
      approverId: emp.id,
      approverName: emp.name,
      department: emp.department,
      position: emp.position,
      order: prev.length + 1,
    }]);
    setEmpSearch('');
    setShowDropdown(false);
  };

  const removeLine = (idx) => {
    setApprovalLines(prev => prev.filter((_, i) => i !== idx).map((l, i) => ({ ...l, order: i + 1 })));
  };

  const handleFieldChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (andSubmit = false) => {
    if (!selectedTemplate) { alert('템플릿을 선택해주세요.'); return; }
    if (!docTitle.trim()) { alert('문서 제목을 입력해주세요.'); return; }
    setSubmitting(true);
    try {
      const payload = {
        templateId: selectedTemplate.id,
        title: docTitle,
        documentType: selectedTemplate.documentType,
        formData,
        approvalLines: approvalLines.map((l, i) => ({ approverId: l.approverId, order: i + 1 })),
      };
      const created = await approvalService.create(payload);
      const docId = created?.data?.id || created?.id;
      if (andSubmit && docId) {
        await approvalService.submit(docId);
        alert('결재 문서가 상신되었습니다.');
      } else {
        alert('임시저장되었습니다.');
      }
      navigate('/approval');
    } catch {
      alert('저장에 실패했습니다. (mock 데이터로 시뮬레이션)');
      navigate('/approval');
    } finally {
      setSubmitting(false);
    }
  };

  const STEPS = ['템플릿 선택', '내용 입력', '결재선 설정'];

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/approval')}>
        ← 결재함으로 돌아가기
      </button>
      <div style={styles.title}>✅ 결재 문서 작성</div>

      {/* 단계 표시 */}
      <div style={styles.stepRow}>
        {STEPS.map((s, i) => (
          <div key={i} style={styles.step(step === i + 1, step > i + 1)}>
            <span style={{
              width: '22px', height: '22px', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700,
              background: step > i + 1 ? '#0f766e' : step === i + 1 ? 'rgba(255,255,255,0.3)' : '#e2e8f0',
              color: step > i + 1 ? '#fff' : step === i + 1 ? '#fff' : '#94a3b8',
            }}>
              {step > i + 1 ? '✓' : i + 1}
            </span>
            {s}
          </div>
        ))}
      </div>

      {/* 단계 1: 템플릿 선택 */}
      {step === 1 && (
        <div style={styles.card}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>문서 양식을 선택하세요</div>
          <div style={styles.templateGrid}>
            {templates.map(t => (
              <div
                key={t.id}
                style={styles.templateCard(selectedTemplate?.id === t.id)}
                onClick={() => { setSelectedTemplate(t); setFormData({}); }}
              >
                <div style={styles.templateIcon}>{t.icon}</div>
                <div style={styles.templateName}>{t.name}</div>
                <div style={styles.templateDesc}>{t.description}</div>
              </div>
            ))}
          </div>
          <div style={{ ...styles.btnRow, marginTop: '20px' }}>
            <div />
            <button
              style={styles.btn('primary')}
              onClick={() => {
                if (!selectedTemplate) { alert('템플릿을 선택해주세요.'); return; }
                setStep(2);
              }}
            >
              다음 →
            </button>
          </div>
        </div>
      )}

      {/* 단계 2: 내용 입력 */}
      {step === 2 && selectedTemplate && (
        <div style={styles.card}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>
            {selectedTemplate.icon} {selectedTemplate.name} 작성
          </div>

          <label style={styles.label}>문서 제목 *</label>
          <input
            style={styles.input}
            placeholder="문서 제목을 입력하세요"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
          />

          {selectedTemplate.formFields?.map(field => (
            <div key={field.key}>
              <label style={styles.label}>{field.label} {field.required && '*'}</label>
              {field.type === 'textarea' ? (
                <textarea
                  style={styles.textarea}
                  placeholder={`${field.label}을(를) 입력하세요`}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                />
              ) : (
                <input
                  style={styles.input}
                  type={field.type || 'text'}
                  placeholder={`${field.label}을(를) 입력하세요`}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                />
              )}
            </div>
          ))}

          <div style={styles.btnRow}>
            <button style={styles.btn('secondary')} onClick={() => setStep(1)}>← 이전</button>
            <button style={styles.btn('primary')} onClick={() => {
              if (!docTitle.trim()) { alert('문서 제목을 입력해주세요.'); return; }
              setStep(3);
            }}>
              다음 →
            </button>
          </div>
        </div>
      )}

      {/* 단계 3: 결재선 설정 */}
      {step === 3 && (
        <div style={styles.card}>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>결재선 설정</div>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '16px' }}>
            결재자를 순서대로 추가해주세요. 결재는 추가된 순서대로 진행됩니다.
          </p>

          {/* 직원 검색 */}
          <label style={styles.label}>결재자 검색</label>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              style={styles.searchInput}
              placeholder="결재자 이름으로 검색..."
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
            {showDropdown && empResults.length > 0 && (
              <div style={styles.dropdown}>
                {empResults.map(emp => (
                  <div
                    key={emp.id}
                    style={styles.dropdownItem}
                    onMouseDown={() => addApprover(emp)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdfa'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
                  >
                    <span style={{ fontWeight: 600 }}>{emp.name}</span>
                    <span style={{ color: '#94a3b8', marginLeft: '8px', fontSize: '0.8rem' }}>
                      {emp.department} · {emp.position}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 추가된 결재자 목록 */}
          {approvalLines.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '8px', marginBottom: '16px' }}>
              결재자를 검색하여 추가해주세요.
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              {approvalLines.map((line, idx) => (
                <div key={idx} style={styles.lineItem}>
                  <span style={styles.orderBadge}>{idx + 1}</span>
                  <span style={{ flex: 1, fontSize: '0.875rem' }}>
                    {line.approverName}
                    <span style={{ color: '#94a3b8', marginLeft: '8px', fontSize: '0.8rem' }}>
                      {line.department} · {line.position}
                    </span>
                  </span>
                  <button onClick={() => removeLine(idx)} style={styles.removeBtn}>×</button>
                </div>
              ))}
            </div>
          )}

          <div style={styles.btnRow}>
            <button style={styles.btn('secondary')} onClick={() => setStep(2)}>← 이전</button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={styles.btn('secondary')}
                onClick={() => handleSave(false)}
                disabled={submitting}
              >
                임시저장
              </button>
              <button
                style={styles.btn('primary')}
                onClick={() => handleSave(true)}
                disabled={submitting || approvalLines.length === 0}
              >
                {submitting ? '처리 중...' : '상신하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalFormPage;
