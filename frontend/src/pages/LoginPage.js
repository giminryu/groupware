import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(15,118,110,0.25)',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
  },
  logoWrap: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  logoIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '12px',
  },
  logoTitle: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#0f766e',
    letterSpacing: '-0.5px',
    marginBottom: '6px',
  },
  logoSub: {
    fontSize: '0.8rem',
    color: '#94a3b8',
    letterSpacing: '0.3px',
  },
  divider: {
    height: '1px',
    background: '#e2e8f0',
    marginBottom: '28px',
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: '20px',
    textAlign: 'center',
  },
  error: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '0.875rem',
    marginBottom: '16px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#475569',
    marginBottom: '6px',
    letterSpacing: '0.2px',
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    boxSizing: 'border-box',
    background: '#fff',
  },
  inputFocus: {
    borderColor: '#14b8a6',
    boxShadow: '0 0 0 3px rgba(20,184,166,0.12)',
  },
  submitBtn: {
    width: '100%',
    padding: '13px 0',
    background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '8px',
    transition: 'opacity 0.15s, transform 0.1s',
    letterSpacing: '0.3px',
  },
  submitBtnDisabled: {
    opacity: 0.65,
    cursor: 'not-allowed',
  },
  hint: {
    marginTop: '16px',
    padding: '10px 14px',
    background: '#f0fdfa',
    border: '1px solid #99f6e4',
    borderRadius: '8px',
    fontSize: '0.78rem',
    color: '#0f766e',
  },
};

function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(formData.username, formData.password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* 로고 */}
        <div style={styles.logoWrap}>
          <span style={styles.logoIcon}>🏢</span>
          <div style={styles.logoTitle}>그룹웨어</div>
          <div style={styles.logoSub}>Enterprise Groupware Portal</div>
        </div>

        <div style={styles.divider} />

        <h2 style={styles.title}>로그인</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="username">사용자 아이디</label>
            <input
              style={{
                ...styles.input,
                ...(focusedField === 'username' ? styles.inputFocus : {}),
              }}
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              placeholder="아이디를 입력하세요"
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label} htmlFor="password">비밀번호</label>
            <input
              style={{
                ...styles.input,
                ...(focusedField === 'password' ? styles.inputFocus : {}),
              }}
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              placeholder="비밀번호를 입력하세요"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitBtn,
              ...(loading ? styles.submitBtnDisabled : {}),
            }}
            onMouseEnter={(e) => { if (!loading) e.target.style.opacity = '0.9'; }}
            onMouseLeave={(e) => { e.target.style.opacity = '1'; }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div style={styles.hint}>
          💡 ITSM 계정과 동일한 아이디/비밀번호를 사용합니다.
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
