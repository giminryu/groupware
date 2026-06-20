import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const styles = {
  page: { width: '100%' },
  title: { fontSize: '1.4rem', fontWeight: 800, color: '#0f766e', marginBottom: '4px' },
  subtitle: { fontSize: '0.875rem', color: '#64748b', marginBottom: '28px' },
  card: {
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden', marginBottom: '20px',
  },
  cardHeader: {
    padding: '16px 24px', borderBottom: '1px solid #f1f5f9',
  },
  cardTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' },
  cardBody: { padding: '24px' },
  profileTop: {
    display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '0',
  },
  avatarWrap: { position: 'relative', cursor: 'pointer' },
  avatar: {
    width: '80px', height: '80px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '2rem', color: '#fff', fontWeight: 700, flexShrink: 0,
  },
  avatarOverlay: {
    position: 'absolute', inset: 0, borderRadius: '50%',
    background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', color: '#fff', fontSize: '0.72rem', fontWeight: 700,
    opacity: 0, transition: 'opacity 0.15s',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: '1.2rem', fontWeight: 800, color: '#0f766e', marginBottom: '4px' },
  profileMeta: { fontSize: '0.85rem', color: '#64748b' },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px',
  },
  formGroup: { marginBottom: '0' },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' },
  input: {
    width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
    borderRadius: '8px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  },
  inputReadonly: {
    width: '100%', padding: '10px 12px', border: '1px solid #f1f5f9',
    borderRadius: '8px', fontSize: '0.875rem', background: '#f8fafc',
    color: '#94a3b8', boxSizing: 'border-box',
  },
  saveBtn: {
    marginTop: '20px', padding: '10px 24px', background: '#0f766e',
    color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.875rem',
    fontWeight: 600, cursor: 'pointer',
  },
  pwSection: { display: 'flex', flexDirection: 'column', gap: '14px' },
  toast: {
    position: 'fixed', bottom: '24px', right: '24px',
    background: '#0f766e', color: '#fff', padding: '12px 20px',
    borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600,
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 9999,
  },
};

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef();
  const [avatarHover, setAvatarHover] = useState(false);
  const [avatarImg, setAvatarImg] = useState(null);
  const [phone, setPhone] = useState(user?.phone || '');
  const [toastMsg, setToastMsg] = useState('');
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });

  const initials = (user?.name || user?.username || '?').slice(0, 2);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2800);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarImg(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async () => {
    try {
      await api.put('/users/me/profile', { phone });
      updateUser({ phone });
      showToast('프로필이 저장되었습니다.');
    } catch {
      updateUser({ phone });
      showToast('프로필이 저장되었습니다. (로컬 반영)');
    }
  };

  const handlePasswordChange = async () => {
    if (!pwForm.current || !pwForm.next) {
      showToast('현재/새 비밀번호를 입력해주세요.');
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      showToast('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (pwForm.next.length < 6) {
      showToast('새 비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    try {
      await api.put('/users/me/password', { currentPassword: pwForm.current, newPassword: pwForm.next });
      showToast('비밀번호가 변경되었습니다.');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch {
      showToast('비밀번호 변경에 실패했습니다. (API 확인 필요)');
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.title}>내 프로필</div>
      <div style={styles.subtitle}>개인 정보 및 계정 설정을 관리합니다.</div>

      {/* 기본 정보 카드 */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>기본 정보</div>
        </div>
        <div style={styles.cardBody}>
          <div style={styles.profileTop}>
            {/* 아바타 */}
            <div
              style={styles.avatarWrap}
              onClick={handleAvatarClick}
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
            >
              <div style={styles.avatar}>
                {avatarImg
                  ? <img src={avatarImg} alt="avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  : initials
                }
              </div>
              <div style={{ ...styles.avatarOverlay, opacity: avatarHover ? 1 : 0 }}>
                사진 변경
              </div>
              <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
            </div>
            <div style={styles.profileInfo}>
              <div style={styles.profileName}>{user?.name || user?.username}</div>
              <div style={styles.profileMeta}>{user?.department || '부서 미지정'} · {user?.position || '직급 미지정'}</div>
            </div>
          </div>

          <div style={{ height: '24px' }} />

          <div style={styles.grid}>
            <div style={styles.formGroup}>
              <label style={styles.label}>이름</label>
              <input readOnly style={styles.inputReadonly} value={user?.name || user?.username || ''} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>이메일</label>
              <input readOnly style={styles.inputReadonly} value={user?.email || ''} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>부서</label>
              <input readOnly style={styles.inputReadonly} value={user?.department || ''} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>직급</label>
              <input readOnly style={styles.inputReadonly} value={user?.position || ''} />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>전화번호</label>
              <input
                style={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="010-0000-0000"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>입사일</label>
              <input readOnly style={styles.inputReadonly} value={user?.joinedDate || user?.createdAt?.slice(0, 10) || '-'} />
            </div>
          </div>

          <button style={styles.saveBtn} onClick={handleProfileSave}>저장</button>
        </div>
      </div>

      {/* 비밀번호 변경 카드 */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.cardTitle}>비밀번호 변경</div>
        </div>
        <div style={styles.cardBody}>
          <div style={styles.pwSection}>
            <div>
              <label style={styles.label}>현재 비밀번호</label>
              <input
                type="password"
                style={styles.input}
                value={pwForm.current}
                onChange={(e) => setPwForm(f => ({ ...f, current: e.target.value }))}
                placeholder="현재 비밀번호 입력"
              />
            </div>
            <div>
              <label style={styles.label}>새 비밀번호</label>
              <input
                type="password"
                style={styles.input}
                value={pwForm.next}
                onChange={(e) => setPwForm(f => ({ ...f, next: e.target.value }))}
                placeholder="6자 이상의 새 비밀번호"
              />
            </div>
            <div>
              <label style={styles.label}>새 비밀번호 확인</label>
              <input
                type="password"
                style={styles.input}
                value={pwForm.confirm}
                onChange={(e) => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                placeholder="새 비밀번호 재입력"
              />
            </div>
          </div>
          <button style={styles.saveBtn} onClick={handlePasswordChange}>비밀번호 변경</button>
        </div>
      </div>

      {/* 토스트 */}
      {toastMsg && <div style={styles.toast}>{toastMsg}</div>}
    </div>
  );
}

export default ProfilePage;
