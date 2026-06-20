import React from 'react';

const styles = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    marginTop: '24px',
  },
  btn: {
    minWidth: '34px',
    height: '34px',
    padding: '0 8px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    background: '#fff',
    color: '#475569',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 500,
    transition: 'all 0.15s',
  },
  btnActive: {
    background: '#0f766e',
    borderColor: '#0f766e',
    color: '#fff',
    fontWeight: 700,
  },
  btnDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
};

function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  const pages = [];
  const delta = 2;
  const left = Math.max(1, current - delta);
  const right = Math.min(total, current + delta);

  for (let i = left; i <= right; i++) pages.push(i);

  return (
    <div style={styles.wrap}>
      <button
        style={{ ...styles.btn, ...(current === 1 ? styles.btnDisabled : {}) }}
        onClick={() => current > 1 && onChange(current - 1)}
        disabled={current === 1}
      >
        ‹
      </button>

      {left > 1 && (
        <>
          <button style={styles.btn} onClick={() => onChange(1)}>1</button>
          {left > 2 && <span style={{ color: '#94a3b8', padding: '0 4px' }}>…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          style={{ ...styles.btn, ...(p === current ? styles.btnActive : {}) }}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}

      {right < total && (
        <>
          {right < total - 1 && <span style={{ color: '#94a3b8', padding: '0 4px' }}>…</span>}
          <button style={styles.btn} onClick={() => onChange(total)}>{total}</button>
        </>
      )}

      <button
        style={{ ...styles.btn, ...(current === total ? styles.btnDisabled : {}) }}
        onClick={() => current < total && onChange(current + 1)}
        disabled={current === total}
      >
        ›
      </button>
    </div>
  );
}

export default Pagination;
