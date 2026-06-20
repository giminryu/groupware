import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MENUS = [
  { key: 'dashboard',    icon: '🏠', label: '홈',       path: '/dashboard' },
  { key: 'notice',       icon: '📢', label: '공지사항', path: '/notice' },
  { key: 'organization', icon: '🏢', label: '조직도',   path: '/organization' },
  { key: 'board',        icon: '💬', label: '게시판',   path: '/board' },
  { key: 'schedule',     icon: '📅', label: '일정',     path: '/schedule' },
  { key: 'files',        icon: '📁', label: '파일함',   path: '/files' },
  { key: 'approval',     icon: '✅', label: '결재',     path: '/approval' },
  { key: 'messenger',    icon: '💬', label: '메신저',   path: '/messenger' },
  { key: 'itsm',         icon: '🎫', label: 'ITSM',    path: '/itsm' },
];

const IMPLEMENTED = ['dashboard', 'organization', 'notice', 'board', 'schedule', 'files', 'approval', 'messenger', 'itsm'];

const styles = {
  sidebar: {
    width: '220px',
    minWidth: '220px',
    height: '100vh',
    background: '#134e4a',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    zIndex: 100,
    overflowY: 'auto',
  },
  logo: {
    padding: '24px 20px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logoTitle: {
    fontSize: '1.4rem',
    fontWeight: 800,
    color: '#5eead4',
    letterSpacing: '-0.5px',
    marginBottom: '4px',
  },
  logoSub: {
    fontSize: '0.7rem',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '0.3px',
  },
  nav: {
    flex: 1,
    padding: '12px 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '11px 20px',
    color: 'rgba(255,255,255,0.7)',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.15s ease',
    borderLeft: '3px solid transparent',
    cursor: 'pointer',
  },
  menuItemActive: {
    background: 'rgba(94,234,212,0.12)',
    color: '#5eead4',
    borderLeftColor: '#5eead4',
  },
  menuItemDisabled: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
  badge: {
    marginLeft: 'auto',
    fontSize: '0.65rem',
    color: 'rgba(255,255,255,0.35)',
    background: 'rgba(255,255,255,0.07)',
    padding: '1px 6px',
    borderRadius: '8px',
  },
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '16px 20px',
  },
  userInfo: {
    marginBottom: '10px',
  },
  userName: {
    display: 'block',
    color: '#fff',
    fontSize: '0.875rem',
    fontWeight: 600,
    marginBottom: '3px',
  },
  userRole: {
    display: 'block',
    color: 'rgba(255,255,255,0.45)',
    fontSize: '0.72rem',
  },
  logoutBtn: {
    width: '100%',
    padding: '8px 0',
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '6px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.8rem',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
};

function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hoveredKey, setHoveredKey] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div style={styles.sidebar}>
      {/* 로고 */}
      <div style={styles.logo}>
        <div style={styles.logoTitle}>그룹웨어</div>
        <div style={styles.logoSub}>Groupware Portal</div>
      </div>

      {/* 네비게이션 */}
      <nav style={styles.nav}>
        {MENUS.map((item) => {
          const implemented = IMPLEMENTED.includes(item.key);
          if (implemented) {
            return (
              <NavLink
                key={item.key}
                to={item.path}
                style={({ isActive }) => ({
                  ...styles.menuItem,
                  ...(isActive ? styles.menuItemActive : {}),
                  ...(hoveredKey === item.key && !isActive ? { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.9)' } : {}),
                })}
                onMouseEnter={() => setHoveredKey(item.key)}
                onMouseLeave={() => setHoveredKey(null)}
              >
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                {item.label}
              </NavLink>
            );
          }
          return (
            <div
              key={item.key}
              style={{ ...styles.menuItem, ...styles.menuItemDisabled }}
              title="개발 예정"
            >
              <span style={{ fontSize: '1rem' }}>{item.icon}</span>
              {item.label}
              <span style={styles.badge}>예정</span>
            </div>
          );
        })}
      </nav>

      {/* 관리자 메뉴 (ADMIN만) */}
      {user?.role === 'ADMIN' && (
        <div style={{ padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <NavLink
            to="/admin"
            style={({ isActive }) => ({
              ...styles.menuItem,
              ...(isActive ? styles.menuItemActive : {}),
            })}
          >
            <span style={{ fontSize: '1rem' }}>⚙️</span>
            관리자
          </NavLink>
        </div>
      )}

      {/* 사용자 정보 + 로그아웃 */}
      <div style={styles.footer}>
        <div
          style={{ ...styles.userInfo, cursor: 'pointer' }}
          onClick={() => navigate('/profile')}
          title="내 프로필"
        >
          <span style={styles.userName}>{user?.name || user?.username}</span>
          <span style={styles.userRole}>
            {user?.role} · {user?.department || '부서 없음'}
          </span>
        </div>
        <button
          style={styles.logoutBtn}
          onClick={handleLogout}
          onMouseEnter={(e) => { e.target.style.background = 'rgba(255,255,255,0.15)'; e.target.style.color = '#fff'; }}
          onMouseLeave={(e) => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.color = 'rgba(255,255,255,0.7)'; }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
