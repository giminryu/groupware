import React from 'react';

const styles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    color: '#94a3b8',
    textAlign: 'center',
  },
  icon: {
    fontSize: '3rem',
    marginBottom: '16px',
  },
  title: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#64748b',
    marginBottom: '6px',
  },
  sub: {
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
};

function EmptyState({ icon = '📭', title = '데이터가 없습니다', sub = '' }) {
  return (
    <div style={styles.wrap}>
      <div style={styles.icon}>{icon}</div>
      <div style={styles.title}>{title}</div>
      {sub && <div style={styles.sub}>{sub}</div>}
    </div>
  );
}

export default EmptyState;
