import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import noticeService from '../../services/noticeService';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';

const MOCK_NOTICES = [
  { id: 1, title: '2024년 하반기 워크숍 안내', authorName: '관리자', viewCount: 45, createdAt: '2024-06-15T09:00:00', viewRequired: true },
  { id: 2, title: '사내 시스템 점검 공지 (6/20)', authorName: '관리자', viewCount: 23, createdAt: '2024-06-14T14:00:00', viewRequired: false },
  { id: 3, title: '복지 포인트 사용 안내', authorName: '관리자', viewCount: 67, createdAt: '2024-06-10T10:00:00', viewRequired: false },
  { id: 4, title: '하계 휴가 일정 안내', authorName: '관리자', viewCount: 112, createdAt: '2024-06-05T11:00:00', viewRequired: true },
  { id: 5, title: '신규 임직원 환영 안내', authorName: '관리자', viewCount: 31, createdAt: '2024-06-01T09:00:00', viewRequired: false },
];

const PAGE_SIZE = 10;

const styles = {
  page: { width: '100%' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  title: { fontSize: '1.4rem', fontWeight: 800, color: '#0f766e' },
  toolbar: { display: 'flex', gap: '10px', alignItems: 'center' },
  searchInput: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 14px',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
    maxWidth: '260px',
    color: '#1e293b',
  },
  createBtn: {
    background: '#0f766e',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 18px',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #e2e8f0',
  },
  th: {
    background: '#f8fafc',
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: '0.78rem',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '14px 16px',
    fontSize: '0.875rem',
    color: '#334155',
    borderBottom: '1px solid #f1f5f9',
  },
  trHover: {
    cursor: 'pointer',
    transition: 'background 0.1s',
  },
  badge: {
    display: 'inline-block',
    background: '#fef3c7',
    color: '#92400e',
    fontSize: '0.7rem',
    fontWeight: 600,
    borderRadius: '4px',
    padding: '2px 6px',
    marginLeft: '6px',
  },
};

function formatDate(str) {
  if (!str) return '-';
  const d = new Date(str);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function NoticePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  const fetchNotices = useCallback(async () => {
    setLoading(true);
    try {
      const result = await noticeService.getList({ page: page - 1, size: PAGE_SIZE, search });
      const items = result?.content || result?.data || result;
      if (Array.isArray(items)) {
        setNotices(items);
        setTotalPages(result?.totalPages || 1);
      } else {
        throw new Error('invalid');
      }
    } catch {
      const filtered = MOCK_NOTICES.filter(n => n.title.includes(search));
      setNotices(filtered);
      setTotalPages(Math.ceil(filtered.length / PAGE_SIZE) || 1);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>📢 공지사항</div>
        <div style={styles.toolbar}>
          <input
            style={styles.searchInput}
            placeholder="검색..."
            value={search}
            onChange={handleSearch}
          />
          {isAdmin && (
            <button style={styles.createBtn} onClick={() => navigate('/notice/create')}>
              + 작성
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>로딩 중...</div>
      ) : notices.length === 0 ? (
        <EmptyState icon="📢" title="공지사항이 없습니다" sub="등록된 공지사항이 없습니다." />
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '12px' }}>
          <table style={{ ...styles.table, minWidth: '600px' }}>
            <thead>
              <tr>
                <th style={styles.th}>번호</th>
                <th style={styles.th}>제목</th>
                <th style={styles.th}>작성자</th>
                <th style={styles.th}>날짜</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>조회수</th>
              </tr>
            </thead>
            <tbody>
              {notices.map((n, idx) => (
                <tr
                  key={n.id}
                  style={{
                    ...styles.trHover,
                    background: hoveredRow === n.id ? '#f0fdfa' : '#fff',
                  }}
                  onClick={() => navigate(`/notice/${n.id}`)}
                  onMouseEnter={() => setHoveredRow(n.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td style={{ ...styles.td, color: '#94a3b8', width: '60px' }}>
                    {(page - 1) * PAGE_SIZE + idx + 1}
                  </td>
                  <td style={styles.td}>
                    {n.title}
                    {n.viewRequired && <span style={styles.badge}>필독</span>}
                  </td>
                  <td style={{ ...styles.td, color: '#64748b' }}>{n.authorName}</td>
                  <td style={{ ...styles.td, color: '#64748b', whiteSpace: 'nowrap' }}>{formatDate(n.createdAt)}</td>
                  <td style={{ ...styles.td, textAlign: 'right', color: '#94a3b8' }}>{n.viewCount ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination current={page} total={totalPages} onChange={setPage} />
    </div>
  );
}

export default NoticePage;
