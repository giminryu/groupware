import React, { useEffect } from 'react';

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
};

const boxStyle = {
  background: '#fff',
  borderRadius: '12px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  width: '100%',
  maxHeight: '90vh',
  overflow: 'auto',
  position: 'relative',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '20px 24px 16px',
  borderBottom: '1px solid #e2e8f0',
};

const titleStyle = {
  fontSize: '1rem',
  fontWeight: 700,
  color: '#1e293b',
};

const closeStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.2rem',
  cursor: 'pointer',
  color: '#94a3b8',
  padding: '4px',
  lineHeight: 1,
};

const bodyStyle = {
  padding: '20px 24px 24px',
};

function Modal({ isOpen, onClose, title, children, maxWidth = '520px' }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...boxStyle, maxWidth }}>
        {title && (
          <div style={headerStyle}>
            <div style={titleStyle}>{title}</div>
            <button style={closeStyle} onClick={onClose}>✕</button>
          </div>
        )}
        <div style={bodyStyle}>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
