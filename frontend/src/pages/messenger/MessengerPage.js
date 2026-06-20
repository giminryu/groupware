import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import api from '../../services/api';
import Modal from '../../components/common/Modal';

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
    { id: 6, senderId: 3, senderName: '이영희', content: '파일 보내드렸습니다', lastMessageAt: '어제' },
  ],
};

const MOCK_EMPLOYEES = [
  { id: 10, name: '김부장', department: '개발팀' },
  { id: 11, name: '이과장', department: '개발팀' },
  { id: 12, name: '박팀장', department: '경영지원팀' },
  { id: 13, name: '최대리', department: '마케팅팀' },
];

function formatTime(str) {
  if (!str) return '';
  if (str.length <= 5) return str;
  const d = new Date(str);
  if (isNaN(d)) return str;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function getInitials(name) {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

const styles = {
  container: {
    display: 'flex', height: 'calc(100vh - 60px)', gap: '0',
    background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
    overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  sidebar: {
    width: '280px', minWidth: '280px', borderRight: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', background: '#fafafa',
  },
  sidebarHeader: {
    padding: '16px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  sidebarTitle: { fontSize: '1rem', fontWeight: 700, color: '#1e293b' },
  searchInput: {
    width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px',
    padding: '8px 12px', fontSize: '0.8rem', outline: 'none',
    boxSizing: 'border-box', background: '#fff', color: '#1e293b',
  },
  btnRow: { display: 'flex', gap: '6px' },
  newBtn: {
    flex: 1, padding: '7px 0', borderRadius: '7px', border: 'none', cursor: 'pointer',
    fontSize: '0.78rem', fontWeight: 600, background: '#0f766e', color: '#fff',
  },
  roomList: { flex: 1, overflowY: 'auto' },
  roomItem: (active, hovered) => ({
    display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
    cursor: 'pointer', borderBottom: '1px solid #f1f5f9',
    background: active ? '#f0fdfa' : hovered ? '#f8fafc' : '#fafafa',
    transition: 'background 0.1s',
  }),
  roomAvatar: (isGroup) => ({
    width: '40px', height: '40px', borderRadius: isGroup ? '10px' : '50%',
    background: isGroup ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #0f766e, #14b8a6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: '0.9rem', fontWeight: 700, flexShrink: 0,
  }),
  roomInfo: { flex: 1, minWidth: 0 },
  roomName: { fontSize: '0.875rem', fontWeight: 600, color: '#1e293b', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  roomLast: { fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  roomMeta: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 },
  roomTime: { fontSize: '0.7rem', color: '#cbd5e1' },
  unreadBadge: {
    background: '#ef4444', color: '#fff', borderRadius: '10px',
    fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', minWidth: '18px', textAlign: 'center',
  },
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column' },
  chatHeader: {
    padding: '14px 20px', borderBottom: '1px solid #e2e8f0',
    display: 'flex', alignItems: 'center', gap: '10px',
    background: '#fff',
  },
  chatAvatar: (isGroup) => ({
    width: '36px', height: '36px', borderRadius: isGroup ? '8px' : '50%',
    background: isGroup ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'linear-gradient(135deg, #0f766e, #14b8a6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: '0.85rem', fontWeight: 700,
  }),
  chatTitle: { fontWeight: 700, fontSize: '1rem', color: '#1e293b' },
  msgList: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  msgGroup: (isMine) => ({
    display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row',
    gap: '8px', alignItems: 'flex-end',
  }),
  msgAvatar: {
    width: '30px', height: '30px', borderRadius: '50%',
    background: '#94a3b8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
  },
  msgContent: (isMine) => ({
    maxWidth: '60%', display: 'flex', flexDirection: 'column',
    alignItems: isMine ? 'flex-end' : 'flex-start',
  }),
  msgSender: { fontSize: '0.75rem', color: '#94a3b8', marginBottom: '3px' },
  msgBubble: (isMine) => ({
    padding: '8px 14px', borderRadius: isMine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
    background: isMine ? '#0f766e' : '#f1f5f9',
    color: isMine ? '#fff' : '#334155', fontSize: '0.875rem', lineHeight: 1.5,
    wordBreak: 'break-word',
  }),
  msgTime: { fontSize: '0.68rem', color: '#cbd5e1', marginTop: '3px' },
  inputArea: {
    padding: '12px 16px', borderTop: '1px solid #e2e8f0',
    display: 'flex', gap: '10px', alignItems: 'flex-end', background: '#fff',
  },
  msgInput: {
    flex: 1, border: '1px solid #e2e8f0', borderRadius: '10px',
    padding: '10px 14px', fontSize: '0.875rem', outline: 'none',
    resize: 'none', maxHeight: '120px', minHeight: '42px', color: '#1e293b',
    boxSizing: 'border-box', fontFamily: 'inherit',
  },
  sendBtn: {
    background: '#0f766e', color: '#fff', border: 'none', borderRadius: '10px',
    padding: '10px 18px', fontWeight: 600, cursor: 'pointer', fontSize: '0.875rem', flexShrink: 0,
  },
  emptyChat: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
  },
  empItem: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 0', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
  },
  empAvatar: {
    width: '32px', height: '32px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', fontSize: '0.8rem', fontWeight: 700,
  },
};

function MessengerPage() {
  const { roomId: paramRoomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [hoveredRoom, setHoveredRoom] = useState(null);
  const [roomSearch, setRoomSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNewChat, setShowNewChat] = useState(false);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmps, setSelectedEmps] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [wsStatus, setWsStatus] = useState('disconnected'); // connected | disconnected | mock
  const wsRef = useRef(null);
  const msgListRef = useRef(null);
  const reconnectTimer = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (msgListRef.current) {
      msgListRef.current.scrollTop = msgListRef.current.scrollHeight;
    }
  }, []);

  // 채팅방 목록 로드
  useEffect(() => {
    chatService.getRooms()
      .then(r => {
        const items = Array.isArray(r) ? r : (r?.data || r?.content || MOCK_ROOMS);
        setRooms(Array.isArray(items) ? items : MOCK_ROOMS);
      })
      .catch(() => setRooms(MOCK_ROOMS))
      .finally(() => setLoading(false));
  }, []);

  // 직원 목록 로드
  useEffect(() => {
    api.get('/employees', { params: { size: 100 } })
      .then(r => {
        const items = r?.data?.content || r?.data || [];
        setEmployees(Array.isArray(items) ? items : MOCK_EMPLOYEES);
      })
      .catch(() => setEmployees(MOCK_EMPLOYEES));
  }, []);

  // 메시지 로드
  const loadMessages = useCallback(async (roomId) => {
    try {
      const result = await chatService.getMessages(roomId, { size: 50 });
      const items = Array.isArray(result) ? result : (result?.content || result?.data || []);
      if (Array.isArray(items) && items.length > 0) {
        setMessages(items);
      } else {
        setMessages(MOCK_MESSAGES[roomId] || []);
      }
    } catch {
      setMessages(MOCK_MESSAGES[roomId] || []);
      setWsStatus('mock');
    }
  }, []);

  // WebSocket 연결
  const connectWebSocket = useCallback((roomId) => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
    }

    try {
      const token = localStorage.getItem('accessToken');
      const ws = new WebSocket(`ws://localhost:8083/ws/chat?token=${token}`);

      ws.onopen = () => {
        setWsStatus('connected');
        ws.send(JSON.stringify({ type: 'JOIN', roomId }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'MESSAGE') {
            setMessages(prev => [...prev, data]);
            setTimeout(scrollToBottom, 50);
          }
        } catch (e) {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        setWsStatus('disconnected');
        reconnectTimer.current = setTimeout(() => connectWebSocket(roomId), 3000);
      };

      ws.onerror = () => {
        setWsStatus('mock');
      };

      wsRef.current = ws;
    } catch {
      setWsStatus('mock');
    }
  }, [scrollToBottom]);

  // 채팅방 선택
  const selectRoom = useCallback((room) => {
    setCurrentRoom(room);
    loadMessages(room.id);
    connectWebSocket(room.id);
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unreadCount: 0 } : r));
    chatService.markRead(room.id).catch(() => {});
    navigate(`/messenger/${room.id}`, { replace: true });
  }, [loadMessages, connectWebSocket, navigate]);

  // URL roomId로 초기 선택
  useEffect(() => {
    if (paramRoomId && rooms.length > 0) {
      const room = rooms.find(r => r.id === Number(paramRoomId));
      if (room && (!currentRoom || currentRoom.id !== room.id)) {
        selectRoom(room);
      }
    }
  }, [paramRoomId, rooms, currentRoom, selectRoom]);

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, []);

  const sendMessage = () => {
    if (!content.trim() || !currentRoom) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'SEND', roomId: currentRoom.id, content }));
    } else {
      // mock: 로컬에 메시지 추가
      const newMsg = {
        id: Date.now(), senderId: user?.id || 1, senderName: user?.name || '나',
        content, createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, newMsg]);
      setRooms(prev => prev.map(r => r.id === currentRoom.id ? { ...r, lastMessage: content, lastMessageAt: formatTime(new Date().toISOString()) } : r));
      setTimeout(scrollToBottom, 50);
    }
    setContent('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const createDirectChat = async (emp) => {
    try {
      const result = await chatService.getOrCreateDirect(emp.id);
      const room = result?.data || result;
      if (room?.id) {
        const newRoom = { ...room, name: emp.name, roomType: 'DIRECT', unreadCount: 0 };
        setRooms(prev => {
          const exists = prev.find(r => r.id === room.id);
          return exists ? prev : [newRoom, ...prev];
        });
        setShowNewChat(false);
        selectRoom(newRoom);
      }
    } catch {
      const mockRoom = { id: Date.now(), name: emp.name, roomType: 'DIRECT', lastMessage: '', lastMessageAt: '', unreadCount: 0 };
      setRooms(prev => [mockRoom, ...prev]);
      setShowNewChat(false);
      selectRoom(mockRoom);
    }
  };

  const createGroupChat = async () => {
    if (!groupName.trim() || selectedEmps.length === 0) {
      alert('그룹 이름과 참여자를 선택해주세요.');
      return;
    }
    try {
      const result = await chatService.createRoom({
        name: groupName,
        roomType: 'GROUP',
        memberIds: selectedEmps.map(e => e.id),
      });
      const room = result?.data || result;
      const newRoom = { ...(room || {}), id: room?.id || Date.now(), name: groupName, roomType: 'GROUP', unreadCount: 0 };
      setRooms(prev => [newRoom, ...prev]);
      setShowNewGroup(false);
      setGroupName('');
      setSelectedEmps([]);
      selectRoom(newRoom);
    } catch {
      const mockRoom = { id: Date.now(), name: groupName, roomType: 'GROUP', lastMessage: '', lastMessageAt: '', unreadCount: 0 };
      setRooms(prev => [mockRoom, ...prev]);
      setShowNewGroup(false);
      setGroupName('');
      setSelectedEmps([]);
      selectRoom(mockRoom);
    }
  };

  const filteredRooms = rooms.filter(r => r.name?.includes(roomSearch));
  const currentUserId = user?.id || 1;

  return (
    <div style={{ maxWidth: '100%' }}>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f766e', marginBottom: '16px' }}>💬 메신저</div>
      <div style={styles.container}>
        {/* 좌측 채팅방 목록 */}
        <div style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarTitle}>채팅 목록</div>
            <input
              style={styles.searchInput}
              placeholder="채팅방 검색..."
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
            />
            <div style={styles.btnRow}>
              <button style={styles.newBtn} onClick={() => setShowNewChat(true)}>+ 새 채팅</button>
              <button style={{ ...styles.newBtn, background: '#6366f1' }} onClick={() => setShowNewGroup(true)}>+ 그룹</button>
            </div>
          </div>

          <div style={styles.roomList}>
            {loading ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>로딩 중...</div>
            ) : filteredRooms.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>채팅방이 없습니다.</div>
            ) : filteredRooms.map(room => (
              <div
                key={room.id}
                style={styles.roomItem(currentRoom?.id === room.id, hoveredRoom === room.id)}
                onClick={() => selectRoom(room)}
                onMouseEnter={() => setHoveredRoom(room.id)}
                onMouseLeave={() => setHoveredRoom(null)}
              >
                <div style={styles.roomAvatar(room.roomType === 'GROUP')}>
                  {room.roomType === 'GROUP' ? '👥' : getInitials(room.name)}
                </div>
                <div style={styles.roomInfo}>
                  <div style={styles.roomName}>{room.name}</div>
                  <div style={styles.roomLast}>{room.lastMessage || '대화를 시작해보세요'}</div>
                </div>
                <div style={styles.roomMeta}>
                  <div style={styles.roomTime}>{room.lastMessageAt || ''}</div>
                  {room.unreadCount > 0 && (
                    <div style={styles.unreadBadge}>{room.unreadCount}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 우측 채팅 영역 */}
        {currentRoom ? (
          <div style={styles.chatArea}>
            {/* 채팅방 헤더 */}
            <div style={styles.chatHeader}>
              <div style={styles.chatAvatar(currentRoom.roomType === 'GROUP')}>
                {currentRoom.roomType === 'GROUP' ? '👥' : getInitials(currentRoom.name)}
              </div>
              <div style={styles.chatTitle}>{currentRoom.name}</div>
              {wsStatus === 'connected' && (
                <span style={{ fontSize: '0.75rem', color: '#16a34a', marginLeft: 'auto' }}>● 연결됨</span>
              )}
              {wsStatus === 'mock' && (
                <span style={{ fontSize: '0.75rem', color: '#f59e0b', marginLeft: 'auto' }}>● 오프라인 모드</span>
              )}
            </div>

            {/* 메시지 목록 */}
            <div style={styles.msgList} ref={msgListRef}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem', marginTop: '20px' }}>
                  대화를 시작해보세요!
                </div>
              ) : messages.map((msg, idx) => {
                const isMine = msg.senderId === currentUserId || msg.senderName === '나' || msg.senderName === user?.name;
                return (
                  <div key={msg.id || idx} style={styles.msgGroup(isMine)}>
                    {!isMine && (
                      <div style={styles.msgAvatar}>{getInitials(msg.senderName)}</div>
                    )}
                    <div style={styles.msgContent(isMine)}>
                      {!isMine && <div style={styles.msgSender}>{msg.senderName}</div>}
                      <div style={styles.msgBubble(isMine)}>{msg.content}</div>
                      <div style={styles.msgTime}>{formatTime(msg.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 입력 영역 */}
            <div style={styles.inputArea}>
              <textarea
                style={styles.msgInput}
                placeholder="메시지를 입력하세요... (Enter: 전송, Shift+Enter: 줄바꿈)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                style={styles.sendBtn}
                onClick={sendMessage}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#0d6b63'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#0f766e'; }}
              >
                전송
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.emptyChat}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💬</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>채팅방을 선택하세요</div>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8' }}>좌측에서 채팅방을 선택하거나 새 채팅을 시작하세요.</div>
          </div>
        )}
      </div>

      {/* 새 1:1 채팅 모달 */}
      <Modal isOpen={showNewChat} onClose={() => setShowNewChat(false)} title="새 채팅 시작" maxWidth="400px">
        <div>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '12px' }}>대화할 상대를 선택하세요</p>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {employees.map(emp => (
              <div
                key={emp.id}
                style={styles.empItem}
                onClick={() => createDirectChat(emp)}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f0fdfa'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={styles.empAvatar}>{getInitials(emp.name)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{emp.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{emp.department}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* 새 그룹 채팅 모달 */}
      <Modal isOpen={showNewGroup} onClose={() => { setShowNewGroup(false); setSelectedEmps([]); setGroupName(''); }} title="새 그룹 채팅" maxWidth="440px">
        <div>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>그룹 이름</label>
            <input
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '9px 14px', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box', color: '#1e293b' }}
              placeholder="그룹 이름 입력..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
            참여자 선택 ({selectedEmps.length}명)
          </div>

          {selectedEmps.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {selectedEmps.map(e => (
                <span key={e.id} style={{ background: '#f0fdfa', border: '1px solid #99f6e4', color: '#0f766e', borderRadius: '12px', padding: '3px 10px', fontSize: '0.78rem', fontWeight: 600 }}>
                  {e.name}
                  <button
                    onClick={() => setSelectedEmps(prev => prev.filter(x => x.id !== e.id))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0f766e', marginLeft: '4px', fontWeight: 700 }}
                  >×</button>
                </span>
              ))}
            </div>
          )}

          <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '16px' }}>
            {employees.map(emp => {
              const selected = selectedEmps.find(e => e.id === emp.id);
              return (
                <div
                  key={emp.id}
                  style={{ ...styles.empItem, background: selected ? '#f0fdfa' : 'transparent' }}
                  onClick={() => {
                    if (selected) setSelectedEmps(prev => prev.filter(e => e.id !== emp.id));
                    else setSelectedEmps(prev => [...prev, emp]);
                  }}
                >
                  <div style={{ ...styles.empAvatar, background: selected ? '#0f766e' : 'linear-gradient(135deg, #94a3b8, #cbd5e1)' }}>
                    {selected ? '✓' : getInitials(emp.name)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{emp.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{emp.department}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#f1f5f9', color: '#475569', fontWeight: 600 }}
              onClick={() => { setShowNewGroup(false); setSelectedEmps([]); setGroupName(''); }}
            >취소</button>
            <button
              style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: '#0f766e', color: '#fff', fontWeight: 600 }}
              onClick={createGroupChat}
            >그룹 만들기</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default MessengerPage;
