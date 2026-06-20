import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orgService, { MOCK_EMPLOYEES } from '../../services/orgService';

const AVATAR_COLORS = [
  '#0f766e', '#0891b2', '#7c3aed', '#db2777', '#ea580c',
  '#16a34a', '#ca8a04', '#dc2626', '#2563eb', '#9333ea',
];

function getAvatarColor(name) {
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const styles = {
  page: {
    maxWidth: '600px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    color: '#0f766e',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '20px',
    padding: '6px 10px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    transition: 'background 0.12s',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  cardTop: {
    background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
    padding: '32px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  avatar: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '1.75rem',
    fontWeight: 800,
    border: '3px solid rgba(255,255,255,0.5)',
    background: 'rgba(255,255,255,0.2)',
    flexShrink: 0,
  },
  nameWrap: {
    color: '#fff',
  },
  name: {
    fontSize: '1.4rem',
    fontWeight: 800,
    marginBottom: '6px',
  },
  positionBadge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.25)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.82rem',
    fontWeight: 600,
    marginRight: '6px',
  },
  leaderBadge: {
    display: 'inline-block',
    background: '#fbbf24',
    color: '#78350f',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontWeight: 700,
  },
  cardBody: {
    padding: '28px',
  },
  sectionTitle: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: '#0f766e',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '14px',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  infoIcon: {
    fontSize: '1.1rem',
    width: '24px',
    textAlign: 'center',
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: '0.72rem',
    color: '#94a3b8',
    fontWeight: 600,
    marginBottom: '2px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  infoValue: {
    fontSize: '0.9rem',
    color: '#1e293b',
    fontWeight: 500,
  },
  notFound: {
    textAlign: 'center',
    padding: '60px',
    color: '#94a3b8',
  },
};

function EmployeePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orgService.getEmployee(id)
      .then((res) => {
        const data = res.data?.data || res.data;
        setEmployee(data);
      })
      .catch(() => {
        // 백엔드 없으면 mock에서 찾기
        const found = MOCK_EMPLOYEES.find((e) => String(e.id) === String(id));
        setEmployee(found || null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#0f766e' }}>
        불러오는 중...
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={styles.notFound}>
        <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>😕</div>
        <div style={{ fontWeight: 600, color: '#475569' }}>직원 정보를 찾을 수 없습니다.</div>
        <button
          style={{ ...styles.backBtn, marginTop: '16px', border: '1px solid #e2e8f0' }}
          onClick={() => navigate('/organization')}
        >
          ← 조직도로 돌아가기
        </button>
      </div>
    );
  }

  const color = getAvatarColor(employee.name);
  const initials = employee.name.slice(0, 1);

  return (
    <div style={styles.page}>
      <button
        style={styles.backBtn}
        onClick={() => navigate('/organization')}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdfa'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
      >
        ← 조직도로 돌아가기
      </button>

      <div style={styles.card}>
        {/* 상단 헤더 */}
        <div style={styles.cardTop}>
          <div style={{ ...styles.avatar, background: `${color}99` }}>
            {initials}
          </div>
          <div style={styles.nameWrap}>
            <div style={styles.name}>{employee.name}</div>
            <span style={styles.positionBadge}>{employee.position}</span>
            {employee.isTeamLeader && (
              <span style={styles.leaderBadge}>👑 팀장</span>
            )}
          </div>
        </div>

        {/* 상세 정보 */}
        <div style={styles.cardBody}>
          <div style={styles.sectionTitle}>연락처 정보</div>
          <div style={styles.infoList}>
            <div style={styles.infoRow}>
              <span style={styles.infoIcon}>🏢</span>
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>소속 부서</div>
                <div style={styles.infoValue}>{employee.department || '-'}</div>
              </div>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoIcon}>🎖️</span>
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>직급</div>
                <div style={styles.infoValue}>{employee.position || '-'}</div>
              </div>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.infoIcon}>📧</span>
              <div style={styles.infoContent}>
                <div style={styles.infoLabel}>이메일</div>
                <div style={styles.infoValue}>
                  <a
                    href={`mailto:${employee.email}`}
                    style={{ color: '#0f766e', textDecoration: 'none' }}
                  >
                    {employee.email || '-'}
                  </a>
                </div>
              </div>
            </div>

            {employee.phone && (
              <div style={styles.infoRow}>
                <span style={styles.infoIcon}>📞</span>
                <div style={styles.infoContent}>
                  <div style={styles.infoLabel}>전화번호</div>
                  <div style={styles.infoValue}>
                    <a
                      href={`tel:${employee.phone}`}
                      style={{ color: '#0f766e', textDecoration: 'none' }}
                    >
                      {employee.phone}
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeePage;
