import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import noticeService from '../../services/noticeService';

const MOCK_NOTICES = {
  1: { id: 1, title: '2024년 하반기 워크숍 안내', authorName: '관리자', viewCount: 45, createdAt: '2024-06-15T09:00:00', viewRequired: true, content: '<p>안녕하세요.</p><p>2024년 하반기 워크숍 일정을 안내드립니다.</p><ul><li>일시: 2024년 7월 5일 (금) 오전 10시</li><li>장소: 사내 대강당</li><li>대상: 전 임직원</li></ul><p>많은 참여 부탁드립니다.</p>' },
  2: { id: 2, title: '사내 시스템 점검 공지 (6/20)', authorName: '관리자', viewCount: 23, createdAt: '2024-06-14T14:00:00', viewRequired: false, content: '<p>6월 20일(목) 오후 11시부터 오전 1시까지 시스템 점검이 진행될 예정입니다.</p><p>점검 시간 동안 서비스 이용이 제한됩니다.</p>' },
  3: { id: 3, title: '복지 포인트 사용 안내', authorName: '관리자', viewCount: 67, createdAt: '2024-06-10T10:00:00', viewRequired: false, content: '<p>2024년 상반기 복지 포인트 사용 방법을 안내드립니다.</p><p>포인트는 복지몰을 통해 사용 가능하며, 미사용 포인트는 6월 30일에 소멸됩니다.</p>' },
  4: { id: 4, title: '하계 휴가 일정 안내', authorName: '관리자', viewCount: 112, createdAt: '2024-06-05T11:00:00', viewRequired: true, content: '<p>2024년 하계 휴가 일정을 안내드립니다.</p><p>하계 휴가: 8월 12일(월) ~ 8월 16일(금)</p>' },
  5: { id: 5, title: '신규 임직원 환영 안내', authorName: '관리자', viewCount: 31, createdAt: '2024-06-01T09:00:00', viewRequired: false, content: '<p>6월 신규 입사자를 환영합니다!</p><p>신규 임직원 오리엔테이션은 6월 3일(월)에 진행될 예정입니다.</p>' },
};

const styles = {
  page: { maxWidth: '860px' },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#0f766e',
    background: 'none',
    border: 'none',
    fontSize: '0.875rem',
    cursor: 'pointer',
    fontWeight: 600,
    padding: 0,
    marginBottom: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '28px 32px 20px',
    borderBottom: '1px solid #f1f5f9',
  },
  badge: {
    display: 'inline-block',
    background: '#fef3c7',
    color: '#92400e',
    fontSize: '0.7rem',
    fontWeight: 700,
    borderRadius: '4px',
    padding: '3px 8px',
    marginBottom: '12px',
  },
  titleText: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#1e293b',
    marginBottom: '14px',
    lineHeight: 1.4,
  },
  meta: {
    display: 'flex',
    gap: '20px',
    fontSize: '0.82rem',
    color: '#94a3b8',
    flexWrap: 'wrap',
  },
  metaItem: { display: 'flex', gap: '4px', alignItems: 'center' },
  body: {
    padding: '28px 32px',
    fontSize: '0.925rem',
    color: '#334155',
    lineHeight: 1.75,
    minHeight: '200px',
  },
  footer: {
    padding: '16px 32px',
    borderTop: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
  },
  editBtn: {
    background: '#f0fdfa',
    color: '#0f766e',
    border: '1px solid #99f6e4',
    borderRadius: '8px',
    padding: '8px 18px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  deleteBtn: {
    background: '#fff5f5',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    padding: '8px 18px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
};

function formatDate(str) {
  if (!str) return '-';
  const d = new Date(str);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function NoticeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await noticeService.getById(id);
        setNotice(data?.data || data);
        noticeService.markViewed(id).catch(() => {});
      } catch {
        setNotice(MOCK_NOTICES[Number(id)] || null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('공지사항을 삭제하시겠습니까?')) return;
    try {
      await noticeService.delete(id);
    } catch {}
    navigate('/notice');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>로딩 중...</div>;
  if (!notice) return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>공지사항을 찾을 수 없습니다.</div>;

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => navigate('/notice')}>
        ← 목록으로
      </button>

      <div style={styles.card}>
        <div style={styles.cardHeader}>
          {notice.viewRequired && <div style={styles.badge}>필독</div>}
          <div style={styles.titleText}>{notice.title}</div>
          <div style={styles.meta}>
            <span style={styles.metaItem}>✍️ {notice.authorName}</span>
            <span style={styles.metaItem}>📅 {formatDate(notice.createdAt)}</span>
            <span style={styles.metaItem}>👁️ {notice.viewCount ?? 0}회</span>
          </div>
        </div>

        <div
          style={styles.body}
          dangerouslySetInnerHTML={{ __html: notice.content || '<p>내용이 없습니다.</p>' }}
        />

        {isAdmin && (
          <div style={styles.footer}>
            <button style={styles.editBtn} onClick={() => navigate(`/notice/${id}/edit`)}>
              수정
            </button>
            <button style={styles.deleteBtn} onClick={handleDelete}>
              삭제
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default NoticeDetailPage;
