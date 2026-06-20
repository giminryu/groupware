import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';

/* ===== Mock 데이터 ===== */
const MOCK_STATS = {
  totalUsers: 12,
  activeUsers: 10,
  totalNotices: 5,
  totalPosts: 23,
  pendingApprovals: 3,
  totalFiles: 47,
  chatRooms: 8,
};

const MOCK_USERS = [
  { id: 1, name: '홍길동', email: 'hong@company.com', department: '경영지원팀', position: '부장', role: 'ADMIN', joinedDate: '2020-03-01' },
  { id: 2, name: '김철수', email: 'kim@company.com', department: '개발팀', position: '과장', role: 'USER', joinedDate: '2021-07-15' },
  { id: 3, name: '이영희', email: 'lee@company.com', department: '개발팀', position: '대리', role: 'USER', joinedDate: '2022-01-10' },
  { id: 4, name: '박민수', email: 'park@company.com', department: '마케팅팀', position: '사원', role: 'USER', joinedDate: '2023-04-01' },
  { id: 5, name: '최지원', email: 'choi@company.com', department: '인사팀', position: '차장', role: 'USER', joinedDate: '2019-08-15' },
];

const MOCK_DEPARTMENTS = [
  { id: 1, name: '경영지원팀', code: 'MNG', memberCount: 3 },
  { id: 2, name: '개발팀', code: 'DEV', memberCount: 5 },
  { id: 3, name: '마케팅팀', code: 'MKT', memberCount: 2 },
  { id: 4, name: '인사팀', code: 'HR', memberCount: 2 },
];

const MOCK_POSITIONS = [
  { id: 1, name: '사원', level: 1 },
  { id: 2, name: '대리', level: 2 },
  { id: 3, name: '과장', level: 3 },
  { id: 4, name: '차장', level: 4 },
  { id: 5, name: '부장', level: 5 },
  { id: 6, name: '이사', level: 6 },
];

const MOCK_BOARDS = [
  { id: 1, name: '자유게시판', code: 'FREE', description: '자유로운 소통 공간', postCount: 15 },
  { id: 2, name: '업무공유', code: 'WORK', description: '업무 관련 정보 공유', postCount: 8 },
  { id: 3, name: 'Q&A', code: 'QNA', description: '질문과 답변', postCount: 5 },
];

const MOCK_MEETING_ROOMS = [
  { id: 1, name: '회의실 A', capacity: 8, floor: '3층', facilities: 'TV, 화이트보드' },
  { id: 2, name: '회의실 B', capacity: 15, floor: '4층', facilities: '프로젝터, 화이트보드' },
  { id: 3, name: '소회의실', capacity: 4, floor: '2층', facilities: '모니터' },
];

/* ===== 스타일 ===== */
const styles = {
  page: { width: '100%' },
  header: { marginBottom: '24px' },
  title: { fontSize: '1.5rem', fontWeight: 800, color: '#0f766e', marginBottom: '4px' },
  subtitle: { fontSize: '0.875rem', color: '#64748b' },
  tabs: {
    display: 'flex', gap: '4px', marginBottom: '24px',
    borderBottom: '2px solid #e2e8f0', paddingBottom: '0',
  },
  tab: {
    padding: '10px 18px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
    color: '#64748b', background: 'none', border: 'none', borderBottom: '2px solid transparent',
    marginBottom: '-2px', transition: 'all 0.15s',
  },
  tabActive: { color: '#0f766e', borderBottomColor: '#0f766e' },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '16px', marginBottom: '24px',
  },
  statCard: {
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  statIcon: { fontSize: '1.8rem' },
  statLabel: { fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' },
  statValue: { fontSize: '1.8rem', fontWeight: 800, color: '#0f766e' },
  card: {
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  cardHeader: {
    padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  cardTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' },
  addBtn: {
    padding: '7px 14px', background: '#0f766e', color: '#fff',
    border: 'none', borderRadius: '6px', fontSize: '0.8rem',
    fontWeight: 600, cursor: 'pointer',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    padding: '10px 16px', textAlign: 'left', fontSize: '0.78rem',
    fontWeight: 700, color: '#64748b', background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '12px 16px', fontSize: '0.85rem', color: '#334155',
    borderBottom: '1px solid #f1f5f9',
  },
  editBtn: {
    padding: '4px 10px', background: '#e0f2fe', color: '#0369a1',
    border: 'none', borderRadius: '4px', fontSize: '0.75rem',
    fontWeight: 600, cursor: 'pointer', marginRight: '6px',
  },
  deleteBtn: {
    padding: '4px 10px', background: '#fee2e2', color: '#dc2626',
    border: 'none', borderRadius: '4px', fontSize: '0.75rem',
    fontWeight: 600, cursor: 'pointer',
  },
  searchBox: {
    padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: '8px',
    fontSize: '0.85rem', width: '100%', maxWidth: '260px', outline: 'none',
  },
  roleBadge: {
    padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700,
  },
  /* 모달 */
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    background: '#fff', borderRadius: '12px', padding: '28px', width: '440px',
    maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  },
  modalTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#0f766e', marginBottom: '20px' },
  formGroup: { marginBottom: '16px' },
  label: { display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#475569', marginBottom: '6px' },
  input: {
    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
    borderRadius: '7px', fontSize: '0.875rem', outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0',
    borderRadius: '7px', fontSize: '0.875rem', outline: 'none',
    boxSizing: 'border-box', background: '#fff',
  },
  modalFooter: { display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' },
  cancelBtn: {
    padding: '9px 18px', background: '#f1f5f9', border: 'none',
    borderRadius: '7px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600,
  },
  saveBtn: {
    padding: '9px 18px', background: '#0f766e', color: '#fff', border: 'none',
    borderRadius: '7px', fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600,
  },
  noAccess: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '400px', gap: '16px',
  },
};

/* ===== 현황 탭 ===== */
function StatsTab({ stats }) {
  const cards = [
    { icon: '👤', label: '전체 사용자', value: stats.totalUsers, suffix: '명' },
    { icon: '📢', label: '공지사항', value: stats.totalNotices, suffix: '건' },
    { icon: '✅', label: '결재 대기', value: stats.pendingApprovals, suffix: '건' },
    { icon: '💬', label: '채팅룸', value: stats.chatRooms, suffix: '개' },
    { icon: '📋', label: '전체 게시글', value: stats.totalPosts, suffix: '건' },
    { icon: '📁', label: '전체 파일', value: stats.totalFiles, suffix: '개' },
  ];
  return (
    <div style={styles.statsGrid}>
      {cards.map((c) => (
        <div key={c.label} style={styles.statCard}>
          <div style={styles.statIcon}>{c.icon}</div>
          <div style={styles.statLabel}>{c.label}</div>
          <div style={styles.statValue}>{c.value}<span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>{c.suffix}</span></div>
        </div>
      ))}
    </div>
  );
}

/* ===== 사용자 관리 탭 ===== */
function UsersTab({ users, departments, positions, onSave }) {
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({});

  const filtered = users.filter(u =>
    u.name.includes(search) || u.email.includes(search)
  );

  const openEdit = (u) => {
    setEditUser(u);
    setForm({ department: u.department, position: u.position, joinedDate: u.joinedDate });
  };

  const handleSave = () => {
    onSave('user', editUser.id, form);
    setEditUser(null);
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <input
          style={styles.searchBox}
          placeholder="이름 또는 이메일 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div style={styles.card}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ ...styles.table, minWidth: '600px' }}>
            <thead>
              <tr>
                {['이름', '이메일', '부서', '직급', '역할', '입사일', ''].map(h => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={styles.td}>{u.name}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.department}</td>
                  <td style={styles.td}>{u.position}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.roleBadge,
                      background: u.role === 'ADMIN' ? '#fef3c7' : '#f0f9ff',
                      color: u.role === 'ADMIN' ? '#92400e' : '#0369a1',
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={styles.td}>{u.joinedDate}</td>
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={() => openEdit(u)}>수정</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editUser && (
        <div style={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) setEditUser(null); }}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>사용자 프로필 수정 — {editUser.name}</div>
            <div style={styles.formGroup}>
              <label style={styles.label}>부서</label>
              <select style={styles.select} value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>직급</label>
              <select style={styles.select} value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))}>
                {positions.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>입사일</label>
              <input type="date" style={styles.input} value={form.joinedDate}
                onChange={e => setForm(f => ({ ...f, joinedDate: e.target.value }))} />
            </div>
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => setEditUser(null)}>취소</button>
              <button style={styles.saveBtn} onClick={handleSave}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== 범용 CRUD 탭 ===== */
function CrudTab({ title, items, columns, onAdd, onEdit, onDelete, renderForm }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  const openAdd = () => { setForm({}); setShowAdd(true); setEditItem(null); };
  const openEdit = (item) => { setForm({ ...item }); setEditItem(item); setShowAdd(false); };
  const handleSave = () => {
    if (editItem) { onEdit(editItem.id, form); }
    else { onAdd(form); }
    setShowAdd(false); setEditItem(null);
  };

  const isModalOpen = showAdd || editItem !== null;

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>{title}</div>
          <button style={styles.addBtn} onClick={openAdd}>+ 추가</button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ ...styles.table, minWidth: '400px' }}>
            <thead>
              <tr>
                {columns.map(c => <th key={c.key} style={styles.th}>{c.label}</th>)}
                <th style={styles.th}>관리</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  {columns.map(c => <td key={c.key} style={styles.td}>{item[c.key]}</td>)}
                  <td style={styles.td}>
                    <button style={styles.editBtn} onClick={() => openEdit(item)}>수정</button>
                    <button style={styles.deleteBtn} onClick={() => onDelete(item.id)}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={styles.overlay} onClick={(e) => { if (e.target === e.currentTarget) { setShowAdd(false); setEditItem(null); } }}>
          <div style={styles.modal}>
            <div style={styles.modalTitle}>{editItem ? `${title.replace('관리', '')} 수정` : `${title.replace('관리', '')} 추가`}</div>
            {renderForm(form, setForm)}
            <div style={styles.modalFooter}>
              <button style={styles.cancelBtn} onClick={() => { setShowAdd(false); setEditItem(null); }}>취소</button>
              <button style={styles.saveBtn} onClick={handleSave}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== 메인 AdminPage ===== */
function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(MOCK_STATS);
  const [users, setUsers] = useState(MOCK_USERS);
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS);
  const [positions, setPositions] = useState(MOCK_POSITIONS);
  const [boards, setBoards] = useState(MOCK_BOARDS);
  const [meetingRooms, setMeetingRooms] = useState(MOCK_MEETING_ROOMS);

  useEffect(() => {
    adminService.getStats().then(setStats).catch(() => setStats(MOCK_STATS));
    adminService.getUsers().then(data => {
      const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
      if (arr.length) setUsers(arr);
    }).catch(() => {});
    adminService.getDepartments().then(data => {
      const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
      if (arr.length) setDepartments(arr);
    }).catch(() => {});
    adminService.getPositions().then(data => {
      const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
      if (arr.length) setPositions(arr);
    }).catch(() => {});
    adminService.getBoards().then(data => {
      const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
      if (arr.length) setBoards(arr);
    }).catch(() => {});
    adminService.getMeetingRooms().then(data => {
      const arr = Array.isArray(data) ? data : (data?.content || data?.data || []);
      if (arr.length) setMeetingRooms(arr);
    }).catch(() => {});
  }, []);

  /* ADMIN 권한 체크 */
  if (user?.role !== 'ADMIN') {
    return (
      <div style={styles.noAccess}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#475569' }}>접근 권한이 없습니다</div>
        <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>관리자(ADMIN) 계정으로 로그인해야 합니다.</div>
      </div>
    );
  }

  const TABS = [
    { key: 'stats', label: '📊 현황' },
    { key: 'users', label: '👥 사용자 관리' },
    { key: 'departments', label: '🏢 부서 관리' },
    { key: 'positions', label: '📋 직급 관리' },
    { key: 'boards', label: '📌 게시판 관리' },
    { key: 'rooms', label: '🏠 회의실 관리' },
  ];

  const handleUserSave = (type, id, form) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...form } : u));
    adminService.updateUserProfile(id, form).catch(() => {});
  };

  const handleDeptAdd = (form) => {
    const newItem = { id: Date.now(), ...form, memberCount: 0 };
    setDepartments(prev => [...prev, newItem]);
    adminService.createDepartment(form).catch(() => {});
  };
  const handleDeptEdit = (id, form) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...form } : d));
    adminService.updateDepartment(id, form).catch(() => {});
  };
  const handleDeptDelete = (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setDepartments(prev => prev.filter(d => d.id !== id));
    adminService.deleteDepartment(id).catch(() => {});
  };

  const handlePosAdd = (form) => {
    setPositions(prev => [...prev, { id: Date.now(), ...form }]);
    adminService.createPosition(form).catch(() => {});
  };
  const handlePosEdit = (id, form) => {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, ...form } : p));
  };
  const handlePosDelete = (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setPositions(prev => prev.filter(p => p.id !== id));
  };

  const handleBoardAdd = (form) => {
    setBoards(prev => [...prev, { id: Date.now(), ...form, postCount: 0 }]);
    adminService.createBoard(form).catch(() => {});
  };
  const handleBoardEdit = (id, form) => {
    setBoards(prev => prev.map(b => b.id === id ? { ...b, ...form } : b));
  };
  const handleBoardDelete = (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setBoards(prev => prev.filter(b => b.id !== id));
  };

  const handleRoomAdd = (form) => {
    setMeetingRooms(prev => [...prev, { id: Date.now(), ...form }]);
    adminService.createMeetingRoom(form).catch(() => {});
  };
  const handleRoomEdit = (id, form) => {
    setMeetingRooms(prev => prev.map(r => r.id === id ? { ...r, ...form } : r));
  };
  const handleRoomDelete = (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    setMeetingRooms(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>⚙️ 관리자 페이지</div>
        <div style={styles.subtitle}>시스템 전체 설정 및 사용자 관리</div>
      </div>

      {/* 탭 */}
      <div style={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            style={{ ...styles.tab, ...(activeTab === t.key ? styles.tabActive : {}) }}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      {activeTab === 'stats' && <StatsTab stats={stats} />}

      {activeTab === 'users' && (
        <UsersTab
          users={users}
          departments={departments}
          positions={positions}
          onSave={handleUserSave}
        />
      )}

      {activeTab === 'departments' && (
        <CrudTab
          title="부서 관리"
          items={departments}
          columns={[
            { key: 'name', label: '부서명' },
            { key: 'code', label: '코드' },
            { key: 'memberCount', label: '구성원' },
          ]}
          onAdd={handleDeptAdd}
          onEdit={handleDeptEdit}
          onDelete={handleDeptDelete}
          renderForm={(form, setForm) => (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>부서명</label>
                <input style={styles.input} value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="예: 개발팀" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>코드</label>
                <input style={styles.input} value={form.code || ''} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="예: DEV" />
              </div>
            </>
          )}
        />
      )}

      {activeTab === 'positions' && (
        <CrudTab
          title="직급 관리"
          items={positions}
          columns={[
            { key: 'name', label: '직급명' },
            { key: 'level', label: '레벨' },
          ]}
          onAdd={handlePosAdd}
          onEdit={handlePosEdit}
          onDelete={handlePosDelete}
          renderForm={(form, setForm) => (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>직급명</label>
                <input style={styles.input} value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="예: 과장" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>레벨 (숫자)</label>
                <input type="number" style={styles.input} value={form.level || ''} onChange={e => setForm(f => ({ ...f, level: Number(e.target.value) }))} placeholder="예: 3" />
              </div>
            </>
          )}
        />
      )}

      {activeTab === 'boards' && (
        <CrudTab
          title="게시판 관리"
          items={boards}
          columns={[
            { key: 'name', label: '게시판명' },
            { key: 'code', label: '코드' },
            { key: 'description', label: '설명' },
            { key: 'postCount', label: '게시글 수' },
          ]}
          onAdd={handleBoardAdd}
          onEdit={handleBoardEdit}
          onDelete={handleBoardDelete}
          renderForm={(form, setForm) => (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>게시판명</label>
                <input style={styles.input} value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="예: 자유게시판" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>코드</label>
                <input style={styles.input} value={form.code || ''} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="예: FREE" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>설명</label>
                <input style={styles.input} value={form.description || ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="게시판 설명" />
              </div>
            </>
          )}
        />
      )}

      {activeTab === 'rooms' && (
        <CrudTab
          title="회의실 관리"
          items={meetingRooms}
          columns={[
            { key: 'name', label: '회의실명' },
            { key: 'capacity', label: '수용 인원' },
            { key: 'floor', label: '층' },
            { key: 'facilities', label: '시설' },
          ]}
          onAdd={handleRoomAdd}
          onEdit={handleRoomEdit}
          onDelete={handleRoomDelete}
          renderForm={(form, setForm) => (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>회의실명</label>
                <input style={styles.input} value={form.name || ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="예: 회의실 A" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>수용 인원</label>
                <input type="number" style={styles.input} value={form.capacity || ''} onChange={e => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} placeholder="예: 8" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>층</label>
                <input style={styles.input} value={form.floor || ''} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} placeholder="예: 3층" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>시설</label>
                <input style={styles.input} value={form.facilities || ''} onChange={e => setForm(f => ({ ...f, facilities: e.target.value }))} placeholder="예: TV, 화이트보드" />
              </div>
            </>
          )}
        />
      )}
    </div>
  );
}

export default AdminPage;
