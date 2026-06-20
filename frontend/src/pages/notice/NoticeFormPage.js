import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import noticeService from '../../services/noticeService';

const MOCK_NOTICES = {
  1: { id: 1, title: '2024년 하반기 워크숍 안내', content: '<p>안녕하세요. 2024년 하반기 워크숍 일정을 안내드립니다.</p>', viewRequired: true },
  2: { id: 2, title: '사내 시스템 점검 공지 (6/20)', content: '<p>6월 20일(목) 오후 11시부터 오전 1시까지 시스템 점검이 진행됩니다.</p>', viewRequired: false },
};

const styles = {
  page: { width: '100%' },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    color: '#0f766e', background: 'none', border: 'none',
    fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600,
    padding: 0, marginBottom: '20px',
  },
  card: {
    background: '#fff', borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    padding: '32px',
  },
  pageTitle: {
    fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '28px',
  },
  formGroup: { marginBottom: '20px' },
  label: {
    display: 'block', fontSize: '0.82rem', fontWeight: 700,
    color: '#475569', marginBottom: '8px', letterSpacing: '0.3px',
  },
  input: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '10px 14px', fontSize: '0.9rem', color: '#1e293b',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  },
  textarea: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '12px 14px', fontSize: '0.9rem', color: '#1e293b',
    outline: 'none', boxSizing: 'border-box', resize: 'vertical',
    minHeight: '280px', lineHeight: 1.6, fontFamily: 'inherit',
  },
  checkRow: {
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
  },
  checkLabel: { fontSize: '0.875rem', color: '#334155', cursor: 'pointer' },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '28px',
    paddingTop: '20px', borderTop: '1px solid #f1f5f9',
  },
  cancelBtn: {
    background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0',
    borderRadius: '8px', padding: '10px 24px', fontSize: '0.875rem',
    fontWeight: 600, cursor: 'pointer',
  },
  saveBtn: {
    background: '#0f766e', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '10px 28px', fontSize: '0.875rem',
    fontWeight: 600, cursor: 'pointer',
  },
};

function NoticeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({ title: '', content: '', viewRequired: false });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    noticeService.getById(id)
      .then(data => {
        const n = data?.data || data;
        setForm({ title: n.title || '', content: n.content || '', viewRequired: n.viewRequired || false });
      })
      .catch(() => {
        const mock = MOCK_NOTICES[Number(id)];
        if (mock) setForm({ title: mock.title, content: mock.content, viewRequired: mock.viewRequired });
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) { alert('제목을 입력하세요.'); return; }
    if (!form.content.trim()) { alert('내용을 입력하세요.'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await noticeService.update(id, form);
        navigate(`/notice/${id}`);
      } else {
        const result = await noticeService.create(form);
        const newId = result?.data?.id || result?.id;
        navigate(newId ? `/notice/${newId}` : '/notice');
      }
    } catch {
      // mock: just go back
      navigate('/notice');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>로딩 중...</div>;

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate(isEdit ? `/notice/${id}` : '/notice')}>
        ← {isEdit ? '상세로' : '목록으로'}
      </button>

      <div style={styles.card}>
        <div style={styles.pageTitle}>{isEdit ? '공지사항 수정' : '공지사항 작성'}</div>

        <div style={styles.formGroup}>
          <label style={styles.label}>제목 *</label>
          <input
            style={styles.input}
            placeholder="제목을 입력하세요"
            value={form.title}
            onChange={handleChange('title')}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>내용 *</label>
          <textarea
            style={styles.textarea}
            placeholder="공지 내용을 입력하세요..."
            value={form.content}
            onChange={handleChange('content')}
          />
        </div>

        <div style={styles.checkRow}>
          <input
            type="checkbox"
            id="viewRequired"
            checked={form.viewRequired}
            onChange={handleChange('viewRequired')}
          />
          <label htmlFor="viewRequired" style={styles.checkLabel}>
            필수 열람 공지로 설정
          </label>
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={() => navigate(isEdit ? `/notice/${id}` : '/notice')}>
            취소
          </button>
          <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default NoticeFormPage;
