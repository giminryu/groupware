import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';

const MOCK_ROOMS = [
  { id: 1, name: '김철수', roomType: 'DIRECT', lastMessage: '네 알겠습니다', lastMessageAt: '10:30', unreadCount: 2 },
  { id: 2, name: '개발팀', roomType: 'GROUP', lastMessage: '회의 일정 확인해주세요', lastMessageAt: '09:15', unreadCount: 0 },
  { id: 3, name: '이영희', roomType: 'DIRECT', lastMessage: '파일 보내드렸습니다', lastMessageAt: '어제', unreadCount: 0 },
];
const MOCK_MESSAGES = {
  1: [
    { id: 1, senderId: 2, senderName: '김철수', content: '안녕하세요!', createdAt: '2024-06-18T10:25:00' },
    { id: 2, senderId: 1, senderName: '나', content: '안녕하세요 김철수님', createdAt: '2024-06-18T10:26:00' },
    { id: 3, senderId: 2, senderName: '김철수', content: '네 알겠습니다', createdAt: '2024-06-18T10:30:00' },
  ],
  2: [
    { id: 4, senderId: 10, senderName: '김부장', content: '안녕하세요 팀원 여러분', createdAt: '2024-06-18T09:00:00' },
    { id: 5, senderId: 2, senderName: '김철수', content: '회의 일정 확인해주세요', createdAt: '2024-06-18T09:15:00' },
  ],
  3: [
    { id: 6, senderId: 3, senderName: '이영희', content: '파일 보내드렸습니다', createdAt: '2024-06-17T15:00:00' },
  ],
};

function formatTime(str) {
  if (!str) return '';
  if (str.length <= 5) return str;
  const d = new Date(str);
  if (isNaN(d)) return str;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function Avatar({ name, size = 32, color = '#0f766e' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 700, flexShrink: 0,
    }}>
      {name ? name.charAt(0) : '?'}
    </div>
  );
}

// 개별 채팅 윈도우
function ChatWindow({ room, currentUser, onClose, wsRef }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    // API 호출 시도 후 mock 폴백
    chatService.getMessages(room.id)
      .then(res => setMessages(res.data || res || []))
      .catch(() => setMessages(MOCK_MESSAGES[room.id] || []));
  }, [room.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebSocket 메시지 수신
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;
    const handler = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'MESSAGE' && data.roomId === room.id) {
          setMessages(prev => [...prev, data]);
        }
      } catch {}
    };
    ws.addEventListener('message', handler);
    return () => ws.removeEventListener('message', handler);
  }, [wsRef, room.id]);

  const send = () => {
    if (!input.trim()) return;
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'SEND', roomId: room.id, content: input }));
    } else {
      // mock: 로컬 추가
      setMessages(prev => [...prev, {
        id: Date.now(), senderId: currentUser?.id,
        senderName: currentUser?.name || '나',
        content: input, createdAt: new Date().toISOString(),
      }]);
    }
    setInput('');
  };

  return (
    <div style={{
      width: 300, height: 400,
      background: '#fff', borderRadius: '12px 12px 0 0',
      border: '1px solid #e2e8f0', borderBottom: 'none',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
      display: 'flex', flexDirection: 'column',
      marginRight: 8,
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 12px', background: '#0f766e',
        borderRadius: '12px 12px 0 0', cursor: 'default',
      }}>
        <Avatar name={room.name} size={28} color="#14b8a6" />
        <span style={{ color: '#fff', fontWeight: 600, fontSize: 14, flex: 1 }}>{room.name}</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
          cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0,
        }}>×</button>
      </div>

      {/* 메시지 목록 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {messages.map(msg => {
          const isMine = msg.senderId === currentUser?.id;
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
              {!isMine && (
                <span style={{ fontSize: 11, color: '#94a3b8', marginBottom: 2 }}>{msg.senderName}</span>
              )}
              <div style={{
                maxWidth: '75%', padding: '7px 10px', borderRadius: isMine ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                background: isMine ? '#0f766e' : '#f1f5f9',
                color: isMine ? '#fff' : '#1e293b', fontSize: 13,
              }}>{msg.content}</div>
              <span style={{ fontSize: 10, color: '#cbd5e1', marginTop: 2 }}>{formatTime(msg.createdAt)}</span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div style={{ display: 'flex', borderTop: '1px solid #f1f5f9', padding: '8px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="메시지 입력..."
          style={{
            flex: 1, border: '1px solid #e2e8f0', borderRadius: 20,
            padding: '6px 12px', fontSize: 13, outline: 'none',
          }}
        />
        <button onClick={send} style={{
          marginLeft: 6, background: '#0f766e', color: '#fff',
          border: 'none', borderRadius: 20, padding: '6px 12px',
          cursor: 'pointer', fontSize: 13,
        }}>전송</button>
      </div>
    </div>
  );
}

// 채팅방 목록 패널
function RoomListPanel({ rooms, onSelectRoom, onClose, totalUnread }) {
  const [search, setSearch] = useState('');
  const filtered = rooms.filter(r => r.name?.includes(search));

  return (
    <div style={{
      width: 280, height: 420,
      background: '#fff', borderRadius: '12px 12px 0 0',
      border: '1px solid #e2e8f0', borderBottom: 'none',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
      display: 'flex', flexDirection: 'column',
      marginRight: 8,
    }}>
      {/* 헤더 */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 14px', background: '#134e4a',
        borderRadius: '12px 12px 0 0',
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, flex: 1 }}>💬 메신저</span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)',
          cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0,
        }}>×</button>
      </div>

      {/* 검색 */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #f1f5f9' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="대화 검색..."
          style={{
            width: '100%', border: '1px solid #e2e8f0', borderRadius: 20,
            padding: '7px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* 채팅방 목록 */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            대화방이 없습니다
          </div>
        )}
        {filtered.map(room => (
          <div key={room.id} onClick={() => onSelectRoom(room)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 14px', cursor: 'pointer',
              borderBottom: '1px solid #f8fafc',
              transition: 'background 0.1s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f0fdfa'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <Avatar name={room.name} size={36} color={room.roomType === 'GROUP' ? '#2563eb' : '#0f766e'} />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>{room.name}</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{room.lastMessageAt}</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {room.lastMessage || '메시지 없음'}
              </div>
            </div>
            {room.unreadCount > 0 && (
              <div style={{
                background: '#ef4444', color: '#fff', borderRadius: 10,
                minWidth: 18, height: 18, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 11, fontWeight: 700, padding: '0 4px',
              }}>{room.unreadCount}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MessengerPopup() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [openChats, setOpenChats] = useState([]); // 열린 채팅 윈도우 목록
  const [totalUnread, setTotalUnread] = useState(0);
  const wsRef = useRef(null);

  // 채팅방 목록 로드
  useEffect(() => {
    chatService.getRooms()
      .then(res => {
        const list = res.data || res || [];
        setRooms(list.length > 0 ? list : MOCK_ROOMS);
        setTotalUnread(list.reduce((s, r) => s + (r.unreadCount || 0), 0));
      })
      .catch(() => {
        setRooms(MOCK_ROOMS);
        setTotalUnread(MOCK_ROOMS.reduce((s, r) => s + r.unreadCount, 0));
      });
  }, []);

  // WebSocket 연결
  useEffect(() => {
    if (!user) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    const ws = new WebSocket(`ws://${window.location.hostname}:8083/ws/chat?token=${token}`);
    wsRef.current = ws;
    ws.onclose = () => { wsRef.current = null; };
    return () => { ws.close(); };
  }, [user]);

  const openChat = useCallback((room) => {
    setOpenChats(prev => {
      if (prev.find(r => r.id === room.id)) return prev;
      return [...prev.slice(-2), room]; // 최대 3개 (목록 포함)
    });
    setOpen(false); // 목록 패널 닫기
  }, []);

  const closeChat = useCallback((roomId) => {
    setOpenChats(prev => prev.filter(r => r.id !== roomId));
  }, []);

  return (
    <div style={{
      position: 'fixed', bottom: 0, right: 20,
      display: 'flex', alignItems: 'flex-end', zIndex: 1000,
    }}>
      {/* 열린 채팅 윈도우들 */}
      {openChats.map(room => (
        <ChatWindow
          key={room.id}
          room={room}
          currentUser={user}
          onClose={() => closeChat(room.id)}
          wsRef={wsRef}
        />
      ))}

      {/* 채팅방 목록 패널 */}
      {open && (
        <RoomListPanel
          rooms={rooms}
          onSelectRoom={openChat}
          onClose={() => setOpen(false)}
          totalUnread={totalUnread}
        />
      )}

      {/* 토글 버튼 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 0 }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            width: 52, height: 52, borderRadius: '50% 50% 0 0',
            background: open ? '#134e4a' : '#0f766e',
            color: '#fff', border: 'none', cursor: 'pointer',
            fontSize: 22, display: 'flex', alignItems: 'center',
            justifyContent: 'center', boxShadow: '0 -2px 12px rgba(0,0,0,0.2)',
            position: 'relative', transition: 'background 0.2s',
          }}
        >
          💬
          {totalUnread > 0 && !open && (
            <div style={{
              position: 'absolute', top: 4, right: 4,
              background: '#ef4444', color: '#fff',
              borderRadius: 10, minWidth: 16, height: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 700, padding: '0 3px',
            }}>{totalUnread}</div>
          )}
        </button>
      </div>
    </div>
  );
}
