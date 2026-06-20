import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import boardService from '../../services/boardService';

const MOCK_BOARDS = [
  { id: 1, name: '자유게시판' },
  { id: 2, name: '업무공유' },
  { id: 3, name: '공지사항' },
];

const styles = {
  page: { width: '100%' },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    color: '#0f766e', background: 'none', border: 'none',
    fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600,
    padding: 0, marginBottom: '20px',
  },
  card: {
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: '32px',
  },
  pageTitle: { fontSize: '1.2rem', fontWeight: 800, color: '#1e293b', marginBottom: '28px' },
  formGroup: { marginBottom: '20px' },
  label: {
    display: 'block', fontSize: '0.82rem', fontWeight: 700,
    color: '#475569', marginBottom: '8px',
  },
  select: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '10px 14px', fontSize: '0.9rem', color: '#1e293b',
    outline: 'none', background: '#fff', boxSizing: 'border-box',
  },
  input: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '10px 14px', fontSize: '0.9rem', color: '#1e293b',
    outline: 'none', boxSizing: 'border-box',
  },
  textarea: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '12px 14px', fontSize: '0.9rem', color: '#1e293b',
    outline: 'none', boxSizing: 'border-box', resize: 'vertical',
    minHeight: '300px', lineHeight: 1.6, fontFamily: 'inherit',
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
    marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #f1f5f9',
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

function PostFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  const [boards, setBoards] = useState(MOCK_BOARDS);
  const [form, setForm] = useState({
    boardId: state.boardId || 1,
    title: state.post?.title || '',
    content: state.post?.content || '',
  });
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(state.postId);

  useEffect(() => {
    boardService.getBoards()
      .then(data => { if (Array.isArray(data?.content || data)) setBoards(data?.content || data); })
      .catch(() => {});
  }, []);

  const handleChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.title.trim()) { alert('제목을 입력하세요.'); return; }
    if (!form.content.trim()) { alert('내용을 입력하세요.'); return; }
    setSaving(true);
    try {
      if (isEdit) {
        await boardService.updatePost(state.postId, { title: form.title, content: form.content });
        navigate(`/board/post/${state.postId}`);
      } else {
        const result = await boardService.createPost(form.boardId, { title: form.title, content: form.content });
        const newId = result?.data?.id || result?.id;
        navigate(newId ? `/board/post/${newId}` : '/board');
      }
    } catch {
      navigate('/board');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/board')}>
        ← 목록으로
      </button>

      <div style={styles.card}>
        <div style={styles.pageTitle}>{isEdit ? '게시물 수정' : '게시물 작성'}</div>

        {!isEdit && (
          <div style={styles.formGroup}>
            <label style={styles.label}>게시판 *</label>
            <select
              style={styles.select}
              value={form.boardId}
              onChange={handleChange('boardId')}
            >
              {boards.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        )}

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
            placeholder="내용을 입력하세요..."
            value={form.content}
            onChange={handleChange('content')}
          />
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={() => navigate('/board')}>취소</button>
          <button style={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PostFormPage;
