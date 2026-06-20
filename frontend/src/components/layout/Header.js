import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notificationService';

const MOCK_NOTIFICATIONS = [
  { id: 1, title: '결재 요청', message: '6월 워크숍 지출 결의 문서의 결재가 요청되었습니다.', isRead: false, createdAt: '2024-06-18T10:00:00', link: '/approval/1' },
  { id: 2, title: '결재 승인', message: '7월 팀 교육 계획 보고 문서가 승인되었습니다.', isRead: false, createdAt: '2024-06-18T09:30:00', link: '/approval/3' },
  { id: 3, title: '새 메시지', message: '김철수님이 메시지를 보냈습니다.', isRead: true, createdAt: '2024-06-17T15:00:00', link: '/messenger/1' },
  { id: 4, title: '공지사항', message: '하계 휴가 일정 안내 공지사항이 등록되었습니다.', isRead: true, createdAt: '2024-06-15T09:00:00', link: '/notice' },
];

function formatNotifDate(str) {
  if (!str) return '';
  const d = new Date(str);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

const styles = {
  header: {
    height: '60px',
    background: '#fff',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    padding: '0 24px',
    gap: '16px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  },
  searchWrap: {
    flex: 1,
    maxWidth: '400px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 14px 8px 36px',
    border: '1px solid #e2e8f0',
    borderRadius: '20px',
    fontSize: '0.875rem',
    background: '#f8fafc',
    outline: 'none',
    color: '#1e293b',
    boxSizing: 'border-box',
  },
  searchIconWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#94a3b8',
    fontSize: '0.875rem',
    pointerEvents: 'none',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginLeft: 'auto',
  },
  notifWrap: { position: 'relative' },
  notifBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    position: 'relative',
    transition: 'all 0.15s',
  },
  notifCount: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: '#ef4444',
    color: '#fff',
    borderRadius: '10px',
    fontSize: '0.65rem',
    fontWeight: 700,
    padding: '1px 5px',
    minWidth: '16px',
    textAlign: 'center',
    border: '1.5px solid #fff',
    lineHeight: '1.4',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '360px',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
    zIndex: 1000,
    maxHeight: '480px',
    overflowY: 'auto',
  },
  dropdownHeader: {
    padding: '14px 16px',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownTitle: { fontWeight: 700, fontSize: '0.95rem', color: '#1e293b' },
  markAllBtn: {
    color: '#0f766e', background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '0.78rem', fontWeight: 600, padding: 0,
  },
  notifItem: (isRead) => ({
    padding: '12px 16px',
    background: isRead ? 'white' : '#f0fdfa',
    borderBottom: '1px solid #f8fafc',
    cursor: 'pointer',
    transition: 'background 0.1s',
  }),
  notifTitle: (isRead) => ({
    fontWeight: isRead ? 500 : 700, fontSize: '0.875rem', color: '#1e293b', marginBottom: '3px',
  }),
  notifMsg: { color: '#64748b', fontSize: '0.8rem', marginBottom: '4px', lineHeight: 1.4 },
  notifTime: { color: '#94a3b8', fontSize: '0.72rem' },
  emptyNotif: { padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '6px 10px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    transition: 'background 0.15s',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '0.8rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1e293b',
  },
};

function Header() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const pollRef = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await notificationService.getUnreadCount();
      const count = result?.data?.count ?? result?.count ?? result;
      setUnreadCount(typeof count === 'number' ? count : 0);
    } catch {
      // 에러 시 mock 기반 유지
      setUnreadCount(MOCK_NOTIFICATIONS.filter(n => !n.isRead).length);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const result = await notificationService.getList({ size: 20 });
      const items = Array.isArray(result) ? result : (result?.content || result?.data || []);
      if (Array.isArray(items) && items.length > 0) {
        setNotifications(items);
        setUnreadCount(items.filter(n => !n.isRead).length);
      } else {
        setNotifications(MOCK_NOTIFICATIONS);
        setUnreadCount(MOCK_NOTIFICATIONS.filter(n => !n.isRead).length);
      }
    } catch {
      setNotifications(MOCK_NOTIFICATIONS);
      setUnreadCount(MOCK_NOTIFICATIONS.filter(n => !n.isRead).length);
    }
  }, []);

  // 초기 알림 목록 로드
  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // 30초마다 미읽음 수 폴링
  useEffect(() => {
    pollRef.current = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(pollRef.current);
  }, [fetchUnreadCount]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleNotifBtnClick = () => {
    if (!showNotifications) fetchNotifications();
    setShowNotifications(v => !v);
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      try {
        await notificationService.markRead(n.id);
      } catch {}
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    setShowNotifications(false);
    if (n.link) navigate(n.link);
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
    } catch {}
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/organization?search=${encodeURIComponent(searchValue.trim())}`);
    }
  };

  const initials = (user?.name || user?.username || '?')
    .split('')
    .slice(0, 1)
    .join('')
    .toUpperCase();

  return (
    <header style={styles.header}>
      {/* 검색창 */}
      <div style={{ ...styles.searchWrap, ...styles.searchIconWrap }}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          style={styles.searchInput}
          type="text"
          placeholder="이름, 부서, 직급으로 검색..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>

      {/* 우측 영역 */}
      <div style={styles.rightSection}>
        {/* 알림 버튼 */}
        <div style={styles.notifWrap} ref={notifRef}>
          <button
            style={styles.notifBtn}
            title="알림"
            onClick={handleNotifBtnClick}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e0f2fe'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; }}
          >
            🔔
            {unreadCount > 0 && (
              <span style={styles.notifCount}>{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>

          {/* 알림 드롭다운 */}
          {showNotifications && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <span style={styles.dropdownTitle}>알림 {unreadCount > 0 && `(${unreadCount})`}</span>
                {unreadCount > 0 && (
                  <button style={styles.markAllBtn} onClick={markAllRead}>모두 읽음</button>
                )}
              </div>
              {notifications.length === 0 ? (
                <div style={styles.emptyNotif}>알림이 없습니다.</div>
              ) : notifications.map(n => (
                <div
                  key={n.id}
                  style={styles.notifItem(n.isRead)}
                  onClick={() => handleNotificationClick(n)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = n.isRead ? '#f8fafc' : '#e6faf7'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = n.isRead ? 'white' : '#f0fdfa'; }}
                >
                  <div style={styles.notifTitle(n.isRead)}>{n.title}</div>
                  <div style={styles.notifMsg}>{n.message}</div>
                  <div style={styles.notifTime}>{formatNotifDate(n.createdAt)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 사용자 정보 */}
        <button
          style={styles.userBtn}
          onClick={() => navigate('/profile')}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <div style={styles.avatar}>{initials}</div>
          <span style={styles.userName}>{user?.name || user?.username}</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
