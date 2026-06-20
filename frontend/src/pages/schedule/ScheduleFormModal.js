import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';

const COLORS = [
  { label: '개인', value: '#0f766e' },
  { label: '팀', value: '#2563eb' },
  { label: '회사', value: '#dc2626' },
  { label: '기타', value: '#7c3aed' },
];

const VISIBILITY = [
  { value: 'PERSONAL', label: '개인' },
  { value: 'TEAM', label: '팀' },
  { value: 'ALL', label: '전사' },
];

const styles = {
  formGroup: { marginBottom: '16px' },
  label: {
    display: 'block', fontSize: '0.8rem', fontWeight: 700,
    color: '#475569', marginBottom: '6px',
  },
  input: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '9px 12px', fontSize: '0.875rem', color: '#1e293b',
    outline: 'none', boxSizing: 'border-box',
  },
  row: { display: 'flex', gap: '12px' },
  checkRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
  checkLabel: { fontSize: '0.875rem', color: '#334155', cursor: 'pointer' },
  select: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '9px 12px', fontSize: '0.875rem', color: '#1e293b',
    outline: 'none', background: '#fff', boxSizing: 'border-box',
  },
  colorRow: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  colorChip: {
    width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
    border: '2px solid transparent', transition: 'transform 0.1s',
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
    marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9',
  },
  cancelBtn: {
    background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0',
    borderRadius: '8px', padding: '9px 20px', fontSize: '0.85rem',
    fontWeight: 600, cursor: 'pointer',
  },
  saveBtn: {
    background: '#0f766e', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '9px 24px', fontSize: '0.85rem',
    fontWeight: 600, cursor: 'pointer',
  },
};

function toLocalDateTimeInput(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function ScheduleFormModal({ isOpen, onClose, onSave, initialDate, schedule }) {
  const isEdit = Boolean(schedule);
  const defaultDate = initialDate ? `${initialDate}T09:00` : '';
  const defaultEnd = initialDate ? `${initialDate}T10:00` : '';

  const [form, setForm] = useState({
    title: '',
    startTime: defaultDate,
    endTime: defaultEnd,
    allDay: false,
    location: '',
    description: '',
    visibility: 'PERSONAL',
    color: '#0f766e',
  });

  useEffect(() => {
    if (schedule) {
      setForm({
        title: schedule.title || '',
        startTime: toLocalDateTimeInput(schedule.startTime),
        endTime: toLocalDateTimeInput(schedule.endTime),
        allDay: schedule.allDay || false,
        location: schedule.location || '',
        description: schedule.description || '',
        visibility: schedule.visibility || 'PERSONAL',
        color: schedule.color || '#0f766e',
      });
    } else {
      setForm(prev => ({
        ...prev,
        title: '',
        startTime: defaultDate,
        endTime: defaultEnd,
        allDay: false,
        location: '',
        description: '',
        visibility: 'PERSONAL',
        color: '#0f766e',
      }));
    }
  }, [schedule, isOpen, defaultDate, defaultEnd]);

  const handleChange = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = () => {
    if (!form.title.trim()) { alert('제목을 입력하세요.'); return; }
    onSave({ ...form, id: schedule?.id });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? '일정 수정' : '일정 추가'} maxWidth="500px">
      <div style={styles.formGroup}>
        <label style={styles.label}>제목 *</label>
        <input style={styles.input} placeholder="일정 제목" value={form.title} onChange={handleChange('title')} />
      </div>

      <div style={styles.checkRow}>
        <input type="checkbox" id="allDay" checked={form.allDay} onChange={handleChange('allDay')} />
        <label htmlFor="allDay" style={styles.checkLabel}>종일</label>
      </div>

      <div style={{ ...styles.row, marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>시작</label>
          <input
            style={styles.input}
            type={form.allDay ? 'date' : 'datetime-local'}
            value={form.allDay ? form.startTime.slice(0, 10) : form.startTime}
            onChange={handleChange('startTime')}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>종료</label>
          <input
            style={styles.input}
            type={form.allDay ? 'date' : 'datetime-local'}
            value={form.allDay ? form.endTime.slice(0, 10) : form.endTime}
            onChange={handleChange('endTime')}
          />
        </div>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>장소</label>
        <input style={styles.input} placeholder="장소 (선택)" value={form.location} onChange={handleChange('location')} />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>설명</label>
        <input style={styles.input} placeholder="설명 (선택)" value={form.description} onChange={handleChange('description')} />
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>공개 범위</label>
        <select style={styles.select} value={form.visibility} onChange={handleChange('visibility')}>
          {VISIBILITY.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}>색상</label>
        <div style={styles.colorRow}>
          {COLORS.map(c => (
            <div
              key={c.value}
              title={c.label}
              style={{
                ...styles.colorChip,
                background: c.value,
                border: form.color === c.value ? `3px solid #1e293b` : '2px solid transparent',
                transform: form.color === c.value ? 'scale(1.2)' : 'scale(1)',
              }}
              onClick={() => setForm(prev => ({ ...prev, color: c.value }))}
            />
          ))}
        </div>
      </div>

      <div style={styles.footer}>
        <button style={styles.cancelBtn} onClick={onClose}>취소</button>
        <button style={styles.saveBtn} onClick={handleSave}>저장</button>
      </div>
    </Modal>
  );
}

export default ScheduleFormModal;
