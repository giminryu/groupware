import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import boardService from '../../services/boardService';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';

const MOCK_BOARDS = [
  { id: 1, name: '자유게시판' },
  { id: 2, name: '업무공유' },
  { id: 3, name: '공지사항' },
];

const MOCK_POSTS = {
  1: [
    { id: 1, boardId: 1, title: '오늘 점심 메뉴 추천', authorName: '김철수', viewCount: 34, commentCount: 5, createdAt: '2024-06-15T12:00:00' },
    { id: 2, boardId: 1, title: '사내 야구팀 멤버 모집합니다', authorName: '이영희', viewCount: 28, commentCount: 12, createdAt: '2024-06-14T10:00:00' },
    { id: 3, boardId: 1, title: '취미 사진 공유해요', authorName: '박민준', viewCount: 19, commentCount: 3, createdAt: '2024-06-13T16:00:00' },
  ],
  2: [
    { id: 4, boardId: 2, title: 'Q2 프로젝트 리뷰 자료 공유', authorName: '정수진', viewCount: 56, commentCount: 2, createdAt: '2024-06-15T09:00:00' },
    { id: 5, boardId: 2, title: '신규 개발 가이드라인 v2.0', authorName: '최동현', viewCount: 89, commentCount: 7, createdAt: '2024-06-12T14:00:00' },
  ],
  3: [
    { id: 6, boardId: 3, title: '전사 회의 일정 변경 안내', authorName: '관리자', viewCount: 120, commentCount: 0, createdAt: '2024-06-15T08:00:00' },
    { id: 7, boardId: 3, title: '6월 생일자 축하 이벤트', authorName: '관리자', viewCount: 78, commentCount: 4, createdAt: '2024-06-10T11:00:00' },
  ],
};

const PAGE_SIZE = 10;

const styles = {
  page: { maxWidth: '1000px' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  title: { fontSize: '1.4rem', fontWeight: 800, color: '#0f766e' },
  layout: { display: 'flex', gap: '20px', alignItems: 'flex-start' },
  sidebar: {
    width: '180px',
    minWidth: '180px',
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  sidebarTitle: {
    padding: '14px 16px 10px',
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '1px solid #f1f5f9',
  },
  boardItem: {
    padding: '11px 16px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    borderLeft: '3px solid transparent',
    color: '#475569',
    fontWeight: 500,
    transition: 'all 0.1s',
  },
  boardItemActive: {
    background: '#f0fdfa',
    color: '#0f766e',
    borderLeftColor: '#0f766e',
    fontWeight: 700,
  },
  main: { flex: 1 },
  mainHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px',
  },
  boardName: { fontSize: '1rem', fontWeight: 700, color: '#1e293b' },
  createBtn: {
    background: '#0f766e', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '7px 16px', fontSize: '0.82rem',
    fontWeight: 600, cursor: 'pointer',
  },
  table: {
    width: '100%', borderCollapse: 'collapse', background: '#fff',
    borderRadius: '12px', overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
  },
  th: {
    background: '#f8fafc', padding: '11px 16px', textAlign: 'left',
    fontSize: '0.75rem', fontWeight: 700, color: '#64748b',
    textTransform: 'uppercase', letterSpacing: '0.4px',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '13px 16px', fontSize: '0.875rem', color: '#334155',
    borderBottom: '1px solid #f1f5f9',
  },
};

function formatDate(str) {
  if (!str) return '-';
  const d = new Date(str);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function BoardPage() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState(MOCK_BOARDS);
  const [selectedBoard, setSelectedBoard] = useState(MOCK_BOARDS[0]);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    boardService.getBoards()
      .then(data => { if (Array.isArray(data?.content || data)) setBoards(data?.content || data); })
      .catch(() => {});
  }, []);

  const fetchPosts = useCallback(async () => {
    if (!selectedBoard) return;
    setLoading(true);
    try {
      const result = await boardService.getPosts(selectedBoard.id, { page: page - 1, size: PAGE_SIZE });
      const items = result?.content || result?.data || result;
      if (Array.isArray(items)) {
        setPosts(items);
        setTotalPages(result?.totalPages || 1);
      } else throw new Error();
    } catch {
      const mock = MOCK_POSTS[selectedBoard.id] || [];
      setPosts(mock);
      setTotalPages(Math.ceil(mock.length / PAGE_SIZE) || 1);
    } finally {
      setLoading(false);
    }
  }, [selectedBoard, page]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleBoardSelect = (b) => {
    setSelectedBoard(b);
    setPage(1);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>💬 게시판</div>
      </div>

      <div style={styles.layout}>
        <div style={styles.sidebar}>
          <div style={styles.sidebarTitle}>게시판</div>
          {boards.map(b => (
            <div
              key={b.id}
              style={{
                ...styles.boardItem,
                ...(selectedBoard?.id === b.id ? styles.boardItemActive : {}),
              }}
              onClick={() => handleBoardSelect(b)}
            >
              {b.name}
            </div>
          ))}
        </div>

        <div style={styles.main}>
          <div style={styles.mainHeader}>
            <div style={styles.boardName}>{selectedBoard?.name}</div>
            <button
              style={styles.createBtn}
              onClick={() => navigate('/board/create', { state: { boardId: selectedBoard?.id, boardName: selectedBoard?.name } })}
            >
              + 글쓰기
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>로딩 중...</div>
          ) : posts.length === 0 ? (
            <EmptyState icon="💬" title="게시물이 없습니다" sub="첫 번째 게시물을 작성해보세요." />
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: '50px' }}>번호</th>
                  <th style={styles.th}>제목</th>
                  <th style={styles.th}>작성자</th>
                  <th style={styles.th}>날짜</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>조회</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p, idx) => (
                  <tr
                    key={p.id}
                    style={{
                      cursor: 'pointer',
                      background: hoveredRow === p.id ? '#f0fdfa' : '#fff',
                      transition: 'background 0.1s',
                    }}
                    onClick={() => navigate(`/board/post/${p.id}`)}
                    onMouseEnter={() => setHoveredRow(p.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td style={{ ...styles.td, color: '#94a3b8' }}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td style={styles.td}>
                      {p.title}
                      {p.commentCount > 0 && (
                        <span style={{ color: '#0f766e', fontSize: '0.78rem', marginLeft: '6px', fontWeight: 600 }}>
                          [{p.commentCount}]
                        </span>
                      )}
                    </td>
                    <td style={{ ...styles.td, color: '#64748b' }}>{p.authorName}</td>
                    <td style={{ ...styles.td, color: '#94a3b8', whiteSpace: 'nowrap' }}>{formatDate(p.createdAt)}</td>
                    <td style={{ ...styles.td, textAlign: 'right', color: '#94a3b8' }}>{p.viewCount ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <Pagination current={page} total={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}

export default BoardPage;
