package com.groupware.service;

import com.groupware.entity.ChatMessage;
import com.groupware.entity.ChatRoom;
import com.groupware.entity.ChatRoomMember;
import com.groupware.mapper.ChatMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMapper chatMapper;

    // 내 채팅방 목록
    public List<ChatRoom> getRooms(Long userId) {
        List<ChatRoom> rooms = chatMapper.findRoomsByUserId(userId);
        for (ChatRoom room : rooms) {
            List<ChatRoomMember> members = chatMapper.findMembersByRoomId(room.getId());
            room.setMembers(members);
        }
        return rooms;
    }

    // 채팅방 생성
    @Transactional
    public ChatRoom createRoom(String name, String roomType, Long createdBy, List<Long> memberIds) {
        ChatRoom room = new ChatRoom();
        room.setName(name);
        room.setRoomType(roomType != null ? roomType : "GROUP");
        room.setCreatedBy(createdBy);
        chatMapper.insertRoom(room);

        // 생성자 추가
        chatMapper.insertMember(room.getId(), createdBy);

        // 멤버 추가
        if (memberIds != null) {
            for (Long memberId : memberIds) {
                if (!memberId.equals(createdBy)) {
                    chatMapper.insertMember(room.getId(), memberId);
                }
            }
        }

        return chatMapper.findRoomById(room.getId());
    }

    // 1:1 채팅방 생성 또는 조회
    @Transactional
    public ChatRoom getOrCreateDirectRoom(Long userId, Long targetUserId) {
        ChatRoom existing = chatMapper.findDirectRoom(userId, targetUserId);
        if (existing != null) {
            List<ChatRoomMember> members = chatMapper.findMembersByRoomId(existing.getId());
            existing.setMembers(members);
            return existing;
        }

        List<Long> memberIds = new ArrayList<>();
        memberIds.add(targetUserId);
        return createRoom(null, "DIRECT", userId, memberIds);
    }

    // 메시지 목록
    public List<ChatMessage> getMessages(Long roomId, Long before) {
        List<ChatMessage> messages = chatMapper.findMessages(roomId, before, 50);
        // 최신순으로 가져온 것을 오래된 순으로 반환
        java.util.Collections.reverse(messages);
        return messages;
    }

    // 메시지 저장
    @Transactional
    public Long saveMessage(Long roomId, Long senderId, String content) {
        com.groupware.entity.ChatMessage message = new com.groupware.entity.ChatMessage();
        message.setRoomId(roomId);
        message.setSenderId(senderId);
        message.setContent(content);
        message.setMessageType("TEXT");
        chatMapper.insertMessage(message);
        chatMapper.updateRoomUpdatedAt(roomId);
        return message.getId();
    }

    // 읽음 처리
    @Transactional
    public void updateLastRead(Long roomId, Long userId) {
        chatMapper.updateLastRead(roomId, userId);
    }

    // 채팅방 정보 조회
    public ChatRoom getRoom(Long roomId) {
        ChatRoom room = chatMapper.findRoomById(roomId);
        if (room != null) {
            List<ChatRoomMember> members = chatMapper.findMembersByRoomId(roomId);
            room.setMembers(members);
        }
        return room;
    }

    // 멤버 여부 확인
    public boolean isMember(Long roomId, Long userId) {
        return chatMapper.existsMember(roomId, userId);
    }
}
