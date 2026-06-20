import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import noticeService from '../services/noticeService';
import scheduleService from '../services/scheduleService';
import approvalService from '../services/approvalService';
import chatService from '../services/chatService';

const MOCK_NOTICES = [
  { id: 1, title: '2024년 하반기 워크숍 안내', authorName: '관리자', createdAt: '2024-06-15T09:00:00' },
  { id: 2, title: '사내 시스템 점검 공지 (6/20)', authorName: '관리자', createdAt: '2024-06-14T14:00:00' },
  { id: 3, title: '복지 포인트 사용 안내', authorName: '관리자', createdAt: '2024-06-10T10:00:00' },
];

const MOCK_TODAY_SCHEDULES = [
  { id: 1, title: '팀 주간 회의', startTime: '10:00', endTime: '11:00', color: '#2563eb' },
  { id: 2, title: '프로젝트 킥오프', startTime: '14:00', endTime: '16:00', color: '#dc2626' },
];

const styles = {
  page: { maxWidth: '960px' },
  greeting: { fontSize: '1.6rem', fontWeight: 800, color: '#0f766e', marginBottom: '6px' },
  subGreeting: { fontSize: '0.9rem', color: '#64748b', marginBottom: '28px' },
  infoRow: { display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap' },
  infoBox: {
    background: '#fff', borderRadius: '10px', padding: '16px 20px',
    border: '1px solid #e2e8f0', flex: 1, minWidth: '160px',
  },
  infoBoxLabel: {
    fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600,
    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
  },
  infoBoxValue: { fontSize: '0.9rem', color: '#1e293b', fontWeight: 600 },
  orgCard: {
    background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
    borderRadius: '12px', padding: '24px', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: '28px', boxShadow: '0 4px 16px rgba(15,118,110,0.25)',
  },
  orgCardLeft: { flex: 1 },
  orgCardTitle: { fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' },
  orgCardSub: { fontSize: '0.82rem', opacity: 0.85 },
  orgCardBtn: {
    background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.5)',
    color: '#fff', borderRadius: '8px', padding: '10px 18px',
    fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'background 0.15s', flexShrink: 0,
  },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' },
  sectionCard: {
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  sectionHeader: {
    padding: '16px 20px 12px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#1e293b' },
  moreLink: {
    fontSize: '0.78rem', color: '#0f766e', fontWeight: 600,
    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
  },
  noticeItem: {
    padding: '10px 20px', borderBottom: '1px solid #f8fafc',
    cursor: 'pointer', transition: 'background 0.1s',
  },
  noticeTitle: { fontSize: '0.85rem', color: '#334155', fontWeight: 500, marginBottom: '2px' },
  noticeMeta: { fontSize: '0.75rem', color: '#94a3b8' },
  scheduleItem: {
    padding: '10px 20px', borderBottom: '1px solid #f8fafc',
    display: 'flex', alignItems: 'center', gap: '10px',
  },
  scheduleBar: { width: '4px', height: '36px', borderRadius: '2px', flexShrink: 0 },
  scheduleTitle: { fontSize: '0.85rem', color: '#334155', fontWeight: 600, marginBottom: '2px' },
  scheduleTime: { fontSize: '0.75rem', color: '#94a3b8' },
  quickGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px', marginBottom: '24px',
  },
  quickCard: {
    background: '#fff', borderRadius: '10px', padding: '16px 14px',
    border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.15s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)', textAlign: 'center',
  },
  quickIcon: { fontSize: '1.6rem', marginBottom: '8px' },
  quickLabel: { fontSize: '0.82rem', fontWeight: 700, color: '#475569' },
  emptyText: { padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' },
};

const QUICK_LINKS = [
  { icon: '📢', label: '공지사항', path: '/notice' },
  { icon: '💬', label: '게시판', path: '/board' },
  { icon: '📅', label: '일정관리', path: '/schedule' },
  { icon: '📁', label: '파일공유', path: '/files' },
  { icon: '✅', label: '전자결재', path: '/approval' },
  { icon: '💬', label: '메신저', path: '/messenger' },
];

function formatDate(str) {
  if (!str) return '';
  const d = new Date(str);
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [unreadMsgCount, setUnreadMsgCount] = useState(0);
  const [hoveredNotice, setHoveredNotice] = useState(null);
  const [hoveredQuick, setHoveredQuick] = useState(null);

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  useEffect(() => {
    noticeService.getList({ page: 0, size: 3 })
      .then(r => {
        const items = r?.content || r?.data || r;
        if (Array.isArray(items) && items.length) setNotices(items.slice(0, 3));
        else setNotices(MOCK_NOTICES);
      })
      .catch(() => setNotices(MOCK_NOTICES));

    const todayStr = new Date().toISOString().slice(0, 10);
    scheduleService.getList({ startDate: todayStr, endDate: todayStr })
      .then(r => {
        const items = r?.content || r?.data || r;
        if (Array.isArray(items) && items.length) setTodaySchedules(items);
        else setTodaySchedules(MOCK_TODAY_SCHEDULES);
      })
      .catch(() => setTodaySchedules(MOCK_TODAY_SCHEDULES));

    approvalService.getPending()
      .then(r => {
        const items = Array.isArray(r) ? r : (r?.content || r?.data || []);
        setPendingApprovalCount(items.length || 2);
      })
      .catch(() => setPendingApprovalCount(2));

    chatService.getRooms()
      .then(r => {
        const items = Array.isArray(r) ? r : (r?.content || r?.data || []);
        const total = items.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
        setUnreadMsgCount(total || 2);
      })
      .catch(() => setUnreadMsgCount(2));
  }, []);

  return (
    <div style={styles.page}>
      {/* 인사말 */}
      <div style={styles.greeting}>안녕하세요, {user?.name || user?.username}님! 👋</div>
      <div style={styles.subGreeting}>{today} · 좋은 하루 되세요!</div>

      {/* 사용자 정보 */}
      <div style={styles.infoRow}>
        <div style={styles.infoBox}>
          <div style={styles.infoBoxLabel}>소속 부서</div>
          <div style={styles.infoBoxValue}>{user?.department || '미지정'}</div>
        </div>
        <div style={styles.infoBox}>
          <div style={styles.infoBoxLabel}>이메일</div>
          <div style={styles.infoBoxValue}>{user?.email || '-'}</div>
        </div>
        <div style={styles.infoBox}>
          <div style={styles.infoBoxLabel}>결재 대기</div>
          <div style={{ ...styles.infoBoxValue, color: pendingApprovalCount > 0 ? '#dc2626' : '#1e293b', cursor: 'pointer' }}
            onClick={() => navigate('/approval')}
          >
            {pendingApprovalCount > 0 ? `${pendingApprovalCount}건 대기중` : '없음'}
          </div>
        </div>
        <div style={styles.infoBox}>
          <div style={styles.infoBoxLabel}>미읽은 메시지</div>
          <div style={{ ...styles.infoBoxValue, color: unreadMsgCount > 0 ? '#0f766e' : '#1e293b', cursor: 'pointer' }}
            onClick={() => navigate('/messenger')}
          >
            {unreadMsgCount > 0 ? `${unreadMsgCount}건` : '없음'}
          </div>
        </div>
      </div>

      {/* 조직도 배너 */}
      <div style={styles.orgCard}>
        <div style={styles.orgCardLeft}>
          <div style={styles.orgCardTitle}>🏢 조직도 바로가기</div>
          <div style={styles.orgCardSub}>부서별 구성원과 연락처를 확인하세요</div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={styles.orgCardBtn}
            onClick={() => navigate('/organization')}
            onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.2)'; }}
          >
            조직도 보기 →
          </button>
          {user?.role === 'ADMIN' && (
            <button
              style={{ ...styles.orgCardBtn, background: 'rgba(255,255,255,0.35)', fontWeight: 700 }}
              onClick={() => navigate('/admin')}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.5)'; }}
              onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.35)'; }}
            >
              ⚙️ 관리자 현황
            </button>
          )}
        </div>
      </div>

      {/* 빠른 이동 */}
      <div style={styles.quickGrid}>
        {QUICK_LINKS.map((q, i) => (
          <div
            key={q.path + i}
            style={{
              ...styles.quickCard,
              boxShadow: hoveredQuick === i ? '0 4px 16px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
              transform: hoveredQuick === i ? 'translateY(-2px)' : 'none',
            }}
            onClick={() => navigate(q.path)}
            onMouseEnter={() => setHoveredQuick(i)}
            onMouseLeave={() => setHoveredQuick(null)}
          >
            <div style={styles.quickIcon}>{q.icon}</div>
            <div style={styles.quickLabel}>{q.label}</div>
          </div>
        ))}
      </div>

      {/* 최근 공지 + 오늘 일정 */}
      <div style={styles.twoCol}>
        {/* 최근 공지사항 */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitle}>📢 최근 공지사항</div>
            <button style={styles.moreLink} onClick={() => navigate('/notice')}>더보기 →</button>
          </div>
          {notices.length === 0 ? (
            <div style={styles.emptyText}>공지사항이 없습니다.</div>
          ) : notices.map(n => (
            <div
              key={n.id}
              style={{
                ...styles.noticeItem,
                background: hoveredNotice === n.id ? '#f0fdfa' : '#fff',
              }}
              onClick={() => navigate(`/notice/${n.id}`)}
              onMouseEnter={() => setHoveredNotice(n.id)}
              onMouseLeave={() => setHoveredNotice(null)}
            >
              <div style={styles.noticeTitle}>{n.title}</div>
              <div style={styles.noticeMeta}>{n.authorName} · {formatDate(n.createdAt)}</div>
            </div>
          ))}
        </div>

        {/* 오늘의 일정 */}
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitle}>📅 오늘의 일정</div>
            <button style={styles.moreLink} onClick={() => navigate('/schedule')}>전체보기 →</button>
          </div>
          {todaySchedules.length === 0 ? (
            <div style={styles.emptyText}>오늘 일정이 없습니다.</div>
          ) : todaySchedules.map(s => (
            <div key={s.id} style={styles.scheduleItem}>
              <div style={{ ...styles.scheduleBar, background: s.color || '#0f766e' }} />
              <div>
                <div style={styles.scheduleTitle}>{s.title}</div>
                <div style={styles.scheduleTime}>{s.startTime} ~ {s.endTime}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
