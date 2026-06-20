import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import boardService from '../../services/boardService';

const MOCK_POSTS = {
  1: { id: 1, boardId: 1, boardName: '자유게시판', title: '오늘 점심 메뉴 추천', authorName: '김철수', viewCount: 34, createdAt: '2024-06-15T12:00:00', content: '오늘 주변에 새로 생긴 한식당이 있던데 가보신 분 있나요? 후기 부탁드립니다!' },
  2: { id: 2, boardId: 1, boardName: '자유게시판', title: '사내 야구팀 멤버 모집합니다', authorName: '이영희', viewCount: 28, createdAt: '2024-06-14T10:00:00', content: '이번 주말 사내 야구 동호회 멤버를 모집합니다. 관심 있는 분은 댓글 남겨주세요!' },
  4: { id: 4, boardId: 2, boardName: '업무공유', title: 'Q2 프로젝트 리뷰 자료 공유', authorName: '정수진', viewCount: 56, createdAt: '2024-06-15T09:00:00', content: 'Q2 프로젝트 리뷰 결과를 공유합니다. 피드백 있으시면 댓글로 남겨주세요.' },
  6: { id: 6, boardId: 3, boardName: '공지사항', title: '전사 회의 일정 변경 안내', authorName: '관리자', viewCount: 120, createdAt: '2024-06-15T08:00:00', content: '6월 전사 회의 일정이 변경되었습니다. 기존 6/20 → 6/25로 변경됩니다.' },
};

const MOCK_COMMENTS = {
  1: [
    { id: 1, authorName: '박민준', content: '저도 가봤는데 맛있어요!', createdAt: '2024-06-15T13:00:00' },
    { id: 2, authorName: '이영희', content: '갈비탕이 진짜 맛있다고 들었어요~', createdAt: '2024-06-15T13:30:00' },
  ],
  2: [
    { id: 3, authorName: '최동현', content: '저 참가하고 싶어요!', createdAt: '2024-06-14T11:00:00' },
  ],
};

const styles = {
  page: { maxWidth: '860px' },
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
    overflow: 'hidden', marginBottom: '20px',
  },
  cardHeader: {
    padding: '24px 28px 18px', borderBottom: '1px solid #f1f5f9',
  },
  boardTag: {
    display: 'inline-block',
    background: '#f0fdfa', color: '#0f766e',
    fontSize: '0.72rem', fontWeight: 700,
    borderRadius: '4px', padding: '3px 8px', marginBottom: '10px',
    border: '1px solid #99f6e4',
  },
  titleText: {
    fontSize: '1.3rem', fontWeight: 800, color: '#1e293b',
    marginBottom: '12px', lineHeight: 1.4,
  },
  meta: {
    display: 'flex', gap: '18px', fontSize: '0.82rem', color: '#94a3b8', flexWrap: 'wrap',
  },
  body: {
    padding: '24px 28px', fontSize: '0.9rem', color: '#334155',
    lineHeight: 1.75, minHeight: '160px',
  },
  footer: {
    padding: '14px 28px', borderTop: '1px solid #f1f5f9',
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
  },
  editBtn: {
    background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4',
    borderRadius: '8px', padding: '7px 16px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
  },
  deleteBtn: {
    background: '#fff5f5', color: '#dc2626', border: '1px solid #fecaca',
    borderRadius: '8px', padding: '7px 16px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
  },
  commentsSection: {
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  commentsHeader: {
    padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
    fontSize: '0.9rem', fontWeight: 700, color: '#1e293b',
  },
  commentItem: {
    padding: '14px 20px', borderBottom: '1px solid #f1f5f9',
  },
  commentAuthor: { fontSize: '0.82rem', fontWeight: 700, color: '#334155', marginBottom: '4px' },
  commentContent: { fontSize: '0.875rem', color: '#475569', lineHeight: 1.6 },
  commentMeta: { fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' },
  commentForm: { padding: '14px 20px', display: 'flex', gap: '10px' },
  commentInput: {
    flex: 1, border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '10px 14px', fontSize: '0.875rem', outline: 'none',
    resize: 'none', fontFamily: 'inherit',
  },
  commentSubmit: {
    background: '#0f766e', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '10px 18px', fontSize: '0.82rem',
    fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
  },
};

function formatDate(str) {
  if (!str) return '-';
  const d = new Date(str);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  const canEdit = post && (user?.name === post.authorName || user?.username === post.authorName || user?.role === 'ADMIN');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await boardService.getPost(id);
        setPost(data?.data || data);
        const cData = await boardService.getComments(id);
        setComments(cData?.content || cData?.data || cData || []);
      } catch {
        setPost(MOCK_POSTS[Number(id)] || null);
        setComments(MOCK_COMMENTS[Number(id)] || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('게시물을 삭제하시겠습니까?')) return;
    try { await boardService.deletePost(id); } catch {}
    navigate('/board');
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    try {
      const result = await boardService.createComment(id, { content: newComment });
      const c = result?.data || result;
      setComments(prev => [...prev, c]);
    } catch {
      setComments(prev => [...prev, {
        id: Date.now(), authorName: user?.name || user?.username || '나',
        content: newComment, createdAt: new Date().toISOString(),
      }]);
    }
    setNewComment('');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>로딩 중...</div>;
  if (!post) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>게시물을 찾을 수 없습니다.</div>;

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/board')}>
        ← 목록으로
      </button>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          {post.boardName && <div style={styles.boardTag}>{post.boardName}</div>}
          <div style={styles.titleText}>{post.title}</div>
          <div style={styles.meta}>
            <span>✍️ {post.authorName}</span>
            <span>📅 {formatDate(post.createdAt)}</span>
            <span>👁️ {post.viewCount ?? 0}회</span>
          </div>
        </div>
        <div style={styles.body}>{post.content}</div>
        {canEdit && (
          <div style={styles.footer}>
            <button style={styles.editBtn} onClick={() => navigate('/board/create', { state: { postId: id, post } })}>수정</button>
            <button style={styles.deleteBtn} onClick={handleDelete}>삭제</button>
          </div>
        )}
      </div>

      <div style={styles.commentsSection}>
        <div style={styles.commentsHeader}>댓글 {comments.length}개</div>
        {comments.map(c => (
          <div key={c.id} style={styles.commentItem}>
            <div style={styles.commentAuthor}>{c.authorName}</div>
            <div style={styles.commentContent}>{c.content}</div>
            <div style={styles.commentMeta}>{formatDate(c.createdAt)}</div>
          </div>
        ))}
        <div style={styles.commentForm}>
          <textarea
            style={styles.commentInput}
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleCommentSubmit(); }}
          />
          <button style={styles.commentSubmit} onClick={handleCommentSubmit}>등록</button>
        </div>
      </div>
    </div>
  );
}

export default PostDetailPage;
