import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import scheduleService from '../../services/scheduleService';
import Modal from '../../components/common/Modal';

const MOCK_ROOMS = [
  { id: 1, name: '소회의실 A', capacity: 6, floor: '3F', amenities: ['TV', '화이트보드'] },
  { id: 2, name: '중회의실 B', capacity: 12, floor: '5F', amenities: ['빔프로젝터', '화이트보드', '전화'] },
  { id: 3, name: '대회의실', capacity: 30, floor: '10F', amenities: ['빔프로젝터', '마이크', 'TV', '화이트보드'] },
  { id: 4, name: '임원 회의실', capacity: 10, floor: '15F', amenities: ['TV', '화이트보드', '전화'] },
];

const MOCK_BOOKINGS = {
  1: [
    { id: 1, startTime: '09:00', endTime: '10:00', bookedBy: '김철수', title: '팀 스탠드업' },
    { id: 2, startTime: '14:00', endTime: '15:00', bookedBy: '이영희', title: '프로젝트 리뷰' },
  ],
  2: [
    { id: 3, startTime: '10:00', endTime: '12:00', bookedBy: '박민준', title: '고객사 미팅' },
  ],
};

const HOURS = Array.from({ length: 10 }, (_, i) => `${String(i + 9).padStart(2, '0')}:00`);

const styles = {
  page: { width: '100%' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
  title: { fontSize: '1.4rem', fontWeight: 800, color: '#0f766e' },
  backBtn: {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    color: '#0f766e', background: 'none', border: 'none',
    fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600, padding: 0,
  },
  roomGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px', marginBottom: '32px',
  },
  roomCard: {
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    padding: '20px', cursor: 'pointer', transition: 'all 0.15s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  roomCardSelected: {
    border: '2px solid #0f766e', background: '#f0fdfa',
  },
  roomName: { fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '6px' },
  roomMeta: { fontSize: '0.82rem', color: '#64748b', marginBottom: '8px' },
  roomAmenity: {
    display: 'inline-block', fontSize: '0.72rem', background: '#f1f5f9',
    color: '#475569', borderRadius: '4px', padding: '2px 6px', margin: '2px',
  },
  section: {
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  sectionHeader: {
    padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#1e293b' },
  dateInput: {
    border: '1px solid #e2e8f0', borderRadius: '8px', padding: '7px 12px',
    fontSize: '0.875rem', outline: 'none', color: '#334155',
  },
  timeline: { padding: '16px 20px' },
  timeRow: {
    display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px',
    padding: '8px 10px', borderRadius: '8px',
  },
  timeLabel: { width: '56px', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, flexShrink: 0 },
  bookingChip: {
    flex: 1, background: '#fef3c7', border: '1px solid #fcd34d',
    borderRadius: '6px', padding: '6px 12px', fontSize: '0.82rem', color: '#92400e', fontWeight: 600,
  },
  emptySlot: {
    flex: 1, border: '1px dashed #e2e8f0', borderRadius: '6px',
    padding: '6px 12px', fontSize: '0.8rem', color: '#cbd5e1',
    cursor: 'pointer', transition: 'all 0.1s',
  },
  bookBtn: {
    background: '#0f766e', color: '#fff', border: 'none',
    borderRadius: '6px', padding: '5px 12px', fontSize: '0.78rem',
    fontWeight: 600, cursor: 'pointer',
  },
  formGroup: { marginBottom: '14px' },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', marginBottom: '6px' },
  input: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '9px 12px', fontSize: '0.875rem', color: '#1e293b',
    outline: 'none', boxSizing: 'border-box',
  },
  modalFooter: {
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
    marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9',
  },
  cancelBtn: {
    background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0',
    borderRadius: '8px', padding: '9px 20px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
  },
  saveBtn: {
    background: '#0f766e', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '9px 24px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
  },
};

function RoomBookingPage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [bookings, setBookings] = useState([]);
  const [bookingModal, setBookingModal] = useState(false);
  const [bookForm, setBookForm] = useState({ title: '', startTime: '09:00', endTime: '10:00' });

  useEffect(() => {
    scheduleService.getRooms()
      .then(data => { if (Array.isArray(data?.content || data)) setRooms(data?.content || data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedRoom) return;
    scheduleService.getRoomBookings(selectedRoom.id, { date: selectedDate })
      .then(data => setBookings(data?.content || data?.data || data || []))
      .catch(() => setBookings(MOCK_BOOKINGS[selectedRoom.id] || []));
  }, [selectedRoom, selectedDate]);

  const getBookingAtHour = (hour) => bookings.find(b => b.startTime?.startsWith(hour));

  const handleBook = async () => {
    if (!bookForm.title.trim()) { alert('제목을 입력하세요.'); return; }
    try {
      await scheduleService.bookRoom(selectedRoom.id, { ...bookForm, date: selectedDate });
    } catch {}
    setBookings(prev => [...prev, { id: Date.now(), ...bookForm, bookedBy: '나' }]);
    setBookingModal(false);
    setBookForm({ title: '', startTime: '09:00', endTime: '10:00' });
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => navigate('/schedule')}>← 일정으로</button>
        <div style={styles.title}>🏢 회의실 예약</div>
        <div />
      </div>

      <div style={styles.roomGrid}>
        {rooms.map(r => (
          <div
            key={r.id}
            style={{
              ...styles.roomCard,
              ...(selectedRoom?.id === r.id ? styles.roomCardSelected : {}),
            }}
            onClick={() => setSelectedRoom(r)}
            onMouseEnter={(e) => { if (selectedRoom?.id !== r.id) e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
          >
            <div style={styles.roomName}>{r.name}</div>
            <div style={styles.roomMeta}>{r.floor} · 최대 {r.capacity}명</div>
            <div>{(r.amenities || []).map(a => <span key={a} style={styles.roomAmenity}>{a}</span>)}</div>
          </div>
        ))}
      </div>

      {selectedRoom && (
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitle}>{selectedRoom.name} 예약 현황</div>
            <input
              type="date"
              style={styles.dateInput}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div style={styles.timeline}>
            {HOURS.map(hour => {
              const booking = getBookingAtHour(hour);
              return (
                <div key={hour} style={styles.timeRow}>
                  <div style={styles.timeLabel}>{hour}</div>
                  {booking ? (
                    <div style={styles.bookingChip}>
                      {booking.title} — {booking.bookedBy}
                    </div>
                  ) : (
                    <div
                      style={styles.emptySlot}
                      onClick={() => { setBookForm(f => ({ ...f, startTime: hour })); setBookingModal(true); }}
                      onMouseEnter={(e) => { e.target.style.background = '#f0fdfa'; e.target.style.borderColor = '#99f6e4'; e.target.style.color = '#0f766e'; }}
                      onMouseLeave={(e) => { e.target.style.background = ''; e.target.style.borderColor = '#e2e8f0'; e.target.style.color = '#cbd5e1'; }}
                    >
                      예약 가능
                    </div>
                  )}
                  {!booking && (
                    <button
                      style={styles.bookBtn}
                      onClick={() => { setBookForm(f => ({ ...f, startTime: hour })); setBookingModal(true); }}
                    >
                      예약
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal isOpen={bookingModal} onClose={() => setBookingModal(false)} title="회의실 예약" maxWidth="420px">
        <div style={styles.formGroup}>
          <label style={styles.label}>회의 제목 *</label>
          <input
            style={styles.input}
            placeholder="회의 제목"
            value={bookForm.title}
            onChange={(e) => setBookForm(f => ({ ...f, title: e.target.value }))}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>시작 시간</label>
            <input
              type="time"
              style={styles.input}
              value={bookForm.startTime}
              onChange={(e) => setBookForm(f => ({ ...f, startTime: e.target.value }))}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>종료 시간</label>
            <input
              type="time"
              style={styles.input}
              value={bookForm.endTime}
              onChange={(e) => setBookForm(f => ({ ...f, endTime: e.target.value }))}
            />
          </div>
        </div>
        <div style={styles.modalFooter}>
          <button style={styles.cancelBtn} onClick={() => setBookingModal(false)}>취소</button>
          <button style={styles.saveBtn} onClick={handleBook}>예약 확정</button>
        </div>
      </Modal>
    </div>
  );
}

export default RoomBookingPage;
