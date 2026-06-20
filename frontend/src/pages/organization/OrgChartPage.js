import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import orgService, { MOCK_DEPARTMENTS, MOCK_EMPLOYEES } from '../../services/orgService';

/* ===== 이니셜 아바타 색상 팔레트 ===== */
const AVATAR_COLORS = [
  '#0f766e', '#0891b2', '#7c3aed', '#db2777', '#ea580c',
  '#16a34a', '#ca8a04', '#dc2626', '#2563eb', '#9333ea',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ===== 직급 정렬 순서 ===== */
const POSITION_ORDER = ['사장', '부사장', '전무', '상무', '이사', '부장', '차장', '과장', '대리', '주임', '사원', '인턴'];

function sortByPosition(employees) {
  return [...employees].sort((a, b) => {
    const ai = POSITION_ORDER.indexOf(a.position);
    const bi = POSITION_ORDER.indexOf(b.position);
    const av = ai === -1 ? 999 : ai;
    const bv = bi === -1 ? 999 : bi;
    return av - bv;
  });
}

/* ===== 스타일 ===== */
const styles = {
  page: {
    display: 'flex',
    gap: '20px',
    height: 'calc(100vh - 108px)',
  },
  /* 좌측 부서 패널 */
  deptPanel: {
    width: '220px',
    minWidth: '220px',
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  deptHeader: {
    padding: '16px',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.85rem',
    fontWeight: 700,
    color: '#0f766e',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  deptList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
  },
  deptItem: {
    padding: '11px 16px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: 'background 0.12s',
    borderLeft: '3px solid transparent',
  },
  deptItemActive: {
    background: '#f0fdfa',
    color: '#0f766e',
    fontWeight: 700,
    borderLeftColor: '#14b8a6',
  },
  deptCount: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    background: '#f1f5f9',
    padding: '1px 7px',
    borderRadius: '10px',
  },
  deptCountActive: {
    background: '#ccfbf1',
    color: '#0f766e',
  },
  /* 우측 직원 패널 */
  mainPanel: {
    flex: 1,
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  mainHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  mainTitle: {
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1e293b',
    flex: 1,
  },
  searchInput: {
    padding: '8px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.85rem',
    outline: 'none',
    width: '200px',
    transition: 'border-color 0.15s',
    color: '#1e293b',
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '20px',
  },
  /* 직원 그리드 */
  empGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '14px',
  },
  empCard: {
    background: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  empCardTop: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  empName: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#1e293b',
  },
  empPosition: {
    fontSize: '0.78rem',
    color: '#0f766e',
    background: '#f0fdfa',
    padding: '2px 7px',
    borderRadius: '10px',
    display: 'inline-block',
    marginTop: '2px',
    border: '1px solid #99f6e4',
  },
  leaderBadge: {
    fontSize: '0.68rem',
    color: '#92400e',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    padding: '1px 7px',
    borderRadius: '10px',
    marginLeft: '4px',
  },
  empDetail: {
    fontSize: '0.78rem',
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
    paddingTop: '6px',
    borderTop: '1px solid #e2e8f0',
  },
  empDetailRow: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  empDetailIcon: {
    fontSize: '0.75rem',
    width: '14px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#94a3b8',
  },
  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: '12px',
  },
  loadingState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#0f766e',
  },
};

function EmployeeCard({ emp, onClick }) {
  const [hovered, setHovered] = useState(false);
  const color = getAvatarColor(emp.name);
  const initials = emp.name.slice(0, 1);

  return (
    <div
      style={{
        ...styles.empCard,
        ...(hovered ? {
          borderColor: '#14b8a6',
          boxShadow: '0 4px 12px rgba(20,184,166,0.15)',
          transform: 'translateY(-2px)',
          background: '#fff',
        } : {}),
      }}
      onClick={() => onClick(emp)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.empCardTop}>
        <div style={{ ...styles.avatar, background: color }}>{initials}</div>
        <div>
          <div style={styles.empName}>
            {emp.name}
            {emp.isTeamLeader && <span style={styles.leaderBadge}>팀장</span>}
          </div>
          <span style={styles.empPosition}>{emp.position}</span>
        </div>
      </div>
      <div style={styles.empDetail}>
        <div style={styles.empDetailRow}>
          <span style={styles.empDetailIcon}>📧</span>
          <span>{emp.email}</span>
        </div>
        {emp.phone && (
          <div style={styles.empDetailRow}>
            <span style={styles.empDetailIcon}>📞</span>
            <span>{emp.phone}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function OrgChartPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [loading, setLoading] = useState(true);
  const [useMock, setUseMock] = useState(false);

  /* 부서 목록 로드 */
  useEffect(() => {
    orgService.getDepartments()
      .then((res) => {
        const data = res.data?.data || res.data || [];
        const list = Array.isArray(data) ? data : [];
        if (list.length === 0) throw new Error('Empty');
        setDepartments(list);
        setSelectedDept(list[0]);
        setUseMock(false);
      })
      .catch(() => {
        setDepartments(MOCK_DEPARTMENTS);
        setSelectedDept(MOCK_DEPARTMENTS[0]);
        setUseMock(true);
      })
      .finally(() => setLoading(false));
  }, []);

  /* 직원 목록 로드 */
  const loadEmployees = useCallback((dept) => {
    if (!dept) return;
    if (useMock) {
      const filtered = MOCK_EMPLOYEES.filter((e) => e.departmentId === dept.id);
      setEmployees(sortByPosition(filtered));
      return;
    }
    orgService.getEmployeesByDepartment(dept.id)
      .then((res) => {
        const data = res.data?.data || res.data || [];
        setEmployees(sortByPosition(Array.isArray(data) ? data : []));
      })
      .catch(() => {
        const filtered = MOCK_EMPLOYEES.filter((e) => e.departmentId === dept.id);
        setEmployees(sortByPosition(filtered));
        setUseMock(true);
      });
  }, [useMock]);

  useEffect(() => {
    if (selectedDept) loadEmployees(selectedDept);
  }, [selectedDept, loadEmployees]);

  /* 검색 필터 */
  const filtered = search.trim()
    ? (useMock ? MOCK_EMPLOYEES : employees).filter(
        (e) =>
          e.name.includes(search) ||
          e.position.includes(search) ||
          e.department?.includes(search) ||
          e.email?.includes(search)
      )
    : employees;

  const displayEmployees = sortByPosition(filtered);
  const isSearchMode = search.trim().length > 0;

  const handleEmployeeClick = (emp) => {
    navigate(`/organization/employee/${emp.id}`);
  };

  if (loading) {
    return (
      <div style={styles.loadingState}>
        <div style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🏢</div>
        <div>조직도 불러오는 중...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* 좌측: 부서 패널 */}
      <div style={styles.deptPanel}>
        <div style={styles.deptHeader}>
          🏢 부서 목록
          {useMock && (
            <span style={{ fontSize: '0.65rem', color: '#f59e0b', marginLeft: 'auto', background: '#fffbeb', padding: '1px 6px', borderRadius: '8px', border: '1px solid #fde68a' }}>
              Mock
            </span>
          )}
        </div>
        <div style={styles.deptList}>
          {departments.map((dept) => {
            const isActive = selectedDept?.id === dept.id;
            return (
              <div
                key={dept.id}
                style={{
                  ...styles.deptItem,
                  ...(isActive ? styles.deptItemActive : {}),
                  color: isActive ? '#0f766e' : '#475569',
                }}
                onClick={() => { setSelectedDept(dept); setSearch(''); }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#f8fafc'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = ''; }}
              >
                <span>{dept.name}</span>
                <span style={{
                  ...styles.deptCount,
                  ...(isActive ? styles.deptCountActive : {}),
                }}>
                  {dept.memberCount || 0}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 우측: 직원 패널 */}
      <div style={styles.mainPanel}>
        <div style={styles.mainHeader}>
          <div style={styles.mainTitle}>
            {isSearchMode
              ? `검색 결과: "${search}" (${displayEmployees.length}명)`
              : `${selectedDept?.name || ''} (${displayEmployees.length}명)`}
          </div>
          <input
            style={styles.searchInput}
            type="text"
            placeholder="이름, 직급, 이메일 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={(e) => { e.target.style.borderColor = '#14b8a6'; }}
            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; }}
          />
        </div>

        <div style={styles.mainContent}>
          {displayEmployees.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>🔍</div>
              <div style={{ fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                {isSearchMode ? '검색 결과가 없습니다' : '구성원이 없습니다'}
              </div>
              {isSearchMode && (
                <div style={{ fontSize: '0.8rem' }}>다른 검색어를 시도해보세요</div>
              )}
            </div>
          ) : (
            <div style={styles.empGrid}>
              {displayEmployees.map((emp) => (
                <EmployeeCard key={emp.id} emp={emp} onClick={handleEmployeeClick} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrgChartPage;
