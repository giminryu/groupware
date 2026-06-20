import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import scheduleService from '../../services/scheduleService';
import ScheduleFormModal from './ScheduleFormModal';

const MOCK_SCHEDULES = [
  { id: 1, title: '팀 주간 회의', startTime: '2024-06-17T10:00:00', endTime: '2024-06-17T11:00:00', color: '#2563eb' },
  { id: 2, title: '프로젝트 킥오프', startTime: '2024-06-19T14:00:00', endTime: '2024-06-19T16:00:00', color: '#dc2626' },
  { id: 3, title: '개인 미팅', startTime: '2024-06-20T09:00:00', endTime: '2024-06-20T09:30:00', color: '#0f766e' },
  { id: 4, title: '월간 보고', startTime: '2024-06-25T14:00:00', endTime: '2024-06-25T15:00:00', color: '#dc2626' },
  { id: 5, title: '1:1 면담', startTime: '2024-06-27T11:00:00', endTime: '2024-06-27T11:30:00', color: '#0f766e' },
];

const WEEKDAYS = ['월', '화', '수', '목', '금', '토', '일'];

const styles = {
  page: { maxWidth: '1100px' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px',
  },
  title: { fontSize: '1.4rem', fontWeight: 800, color: '#0f766e' },
  controls: { display: 'flex', alignItems: 'center', gap: '10px' },
  navBtn: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '7px 14px', fontSize: '0.9rem', cursor: 'pointer', color: '#334155',
    fontWeight: 600, transition: 'all 0.1s',
  },
  monthLabel: { fontSize: '1.1rem', fontWeight: 700, color: '#1e293b', minWidth: '140px', textAlign: 'center' },
  todayBtn: {
    background: '#f0fdfa', border: '1px solid #99f6e4', borderRadius: '8px',
    padding: '7px 14px', fontSize: '0.82rem', cursor: 'pointer', color: '#0f766e', fontWeight: 700,
  },
  addBtn: {
    background: '#0f766e', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '8px 18px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
  },
  roomBtn: {
    background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', color: '#475569',
  },
  calWrap: {
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)', overflow: 'hidden',
  },
  weekHeader: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #e2e8f0' },
  weekDay: {
    padding: '10px 0', textAlign: 'center', fontSize: '0.78rem',
    fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px',
  },
  calGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' },
  dayCell: {
    minHeight: '110px',
    padding: '6px 8px',
    borderRight: '1px solid #f1f5f9',
    borderBottom: '1px solid #f1f5f9',
    cursor: 'pointer',
    transition: 'background 0.1s',
    position: 'relative',
    boxSizing: 'border-box',
  },
  dayNum: {
    fontSize: '0.82rem', fontWeight: 600, color: '#475569',
    marginBottom: '4px', display: 'inline-block',
    width: '24px', height: '24px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  todayNum: {
    background: '#0f766e', color: '#fff !important',
  },
  eventChip: {
    fontSize: '0.72rem', fontWeight: 600, borderRadius: '4px',
    padding: '2px 6px', marginBottom: '2px', overflow: 'hidden',
    textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer',
  },
  moreTag: {
    fontSize: '0.7rem', color: '#94a3b8', padding: '2px 4px', fontWeight: 600,
  },
};

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Convert so Monday=0, Sunday=6
  const startOffset = (firstDay + 6) % 7;
  const days = [];
  for (let i = 0; i < startOffset; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

function toDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function SchedulePage() {
  const navigate = useNavigate();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [schedules, setSchedules] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [editSchedule, setEditSchedule] = useState(null);

  const todayKey = toDateKey(now.getFullYear(), now.getMonth(), now.getDate());

  const fetchSchedules = useCallback(async () => {
    try {
      const result = await scheduleService.getList({
        startDate: `${year}-${String(month + 1).padStart(2, '0')}-01`,
        endDate: `${year}-${String(month + 1).padStart(2, '0')}-31`,
      });
      const items = result?.content || result?.data || result;
      if (Array.isArray(items) && items.length > 0) setSchedules(items);
      else setSchedules(MOCK_SCHEDULES);
    } catch {
      setSchedules(MOCK_SCHEDULES);
    }
  }, [year, month]);

  useEffect(() => { fetchSchedules(); }, [fetchSchedules]);

  const days = getMonthDays(year, month);

  const getSchedulesForDay = (day) => {
    if (!day) return [];
    const key = toDateKey(year, month, day);
    return schedules.filter(s => {
      const d = new Date(s.startTime);
      const sk = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return sk === key;
    });
  };

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  };
  const goToday = () => { setYear(now.getFullYear()); setMonth(now.getMonth()); };

  const handleDayClick = (day) => {
    if (!day) return;
    setSelectedDate(toDateKey(year, month, day));
    setEditSchedule(null);
    setModalOpen(true);
  };

  const handleEventClick = (e, s) => {
    e.stopPropagation();
    setEditSchedule(s);
    setSelectedDate(null);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    try {
      if (form.id) {
        await scheduleService.update(form.id, form);
      } else {
        await scheduleService.create(form);
      }
    } catch {}
    if (form.id) {
      setSchedules(prev => prev.map(s => s.id === form.id ? { ...s, ...form } : s));
    } else {
      setSchedules(prev => [...prev, { ...form, id: Date.now() }]);
    }
  };

  const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.title}>📅 일정관리</div>
        <div style={styles.controls}>
          <button style={styles.roomBtn} onClick={() => navigate('/schedule/rooms')}>
            🏢 회의실 예약
          </button>
          <button style={styles.addBtn} onClick={() => { setSelectedDate(todayKey); setEditSchedule(null); setModalOpen(true); }}>
            + 일정 추가
          </button>
        </div>
      </div>

      <div style={styles.calWrap}>
        {/* 월 네비게이션 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #e2e8f0',
        }}>
          <button style={styles.navBtn} onClick={prevMonth}>‹</button>
          <div style={styles.monthLabel}>{year}년 {MONTH_NAMES[month]}</div>
          <button style={styles.navBtn} onClick={nextMonth}>›</button>
          <button style={styles.todayBtn} onClick={goToday}>오늘</button>
        </div>

        {/* 요일 헤더 */}
        <div style={styles.weekHeader}>
          {WEEKDAYS.map(d => (
            <div key={d} style={{
              ...styles.weekDay,
              color: d === '토' ? '#2563eb' : d === '일' ? '#dc2626' : '#94a3b8',
            }}>{d}</div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div style={styles.calGrid}>
          {days.map((day, idx) => {
            const key = day ? toDateKey(year, month, day) : null;
            const isToday = key === todayKey;
            const daySchedules = getSchedulesForDay(day);
            const colPos = idx % 7; // 0=Mon, 5=Sat, 6=Sun
            const isSat = colPos === 5;
            const isSun = colPos === 6;

            return (
              <div
                key={idx}
                style={{
                  ...styles.dayCell,
                  background: !day ? '#fafafa' : isToday ? '#f0fdfa' : '#fff',
                  opacity: !day ? 0.5 : 1,
                }}
                onClick={() => handleDayClick(day)}
              >
                {day && (
                  <div style={{
                    ...styles.dayNum,
                    background: isToday ? '#0f766e' : 'transparent',
                    color: isToday ? '#fff' : isSat ? '#2563eb' : isSun ? '#dc2626' : '#475569',
                  }}>
                    {day}
                  </div>
                )}
                {daySchedules.slice(0, 3).map(s => (
                  <div
                    key={s.id}
                    style={{
                      ...styles.eventChip,
                      background: s.color + '22',
                      color: s.color,
                      borderLeft: `3px solid ${s.color}`,
                    }}
                    onClick={(e) => handleEventClick(e, s)}
                    title={s.title}
                  >
                    {s.title}
                  </div>
                ))}
                {daySchedules.length > 3 && (
                  <div style={styles.moreTag}>+{daySchedules.length - 3}개 더</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <ScheduleFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initialDate={selectedDate}
        schedule={editSchedule}
      />
    </div>
  );
}

export default SchedulePage;
