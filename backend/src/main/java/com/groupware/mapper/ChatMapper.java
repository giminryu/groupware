package com.groupware.mapper;

import com.groupware.entity.ChatMessage;
import com.groupware.entity.ChatRoom;
import com.groupware.entity.ChatRoomMember;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ChatMapper {

    // 채팅방
    List<ChatRoom> findRoomsByUserId(@Param("userId") Long userId);
    ChatRoom findRoomById(@Param("id") Long id);
    void insertRoom(ChatRoom room);
    void updateRoomUpdatedAt(@Param("id") Long id);

    // 멤버
    List<ChatRoomMember> findMembersByRoomId(@Param("roomId") Long roomId);
    void insertMember(@Param("roomId") Long roomId, @Param("userId") Long userId);
    boolean existsMember(@Param("roomId") Long roomId, @Param("userId") Long userId);
    void updateLastRead(@Param("roomId") Long roomId, @Param("userId") Long userId);

    // 1:1 채팅방 조회
    ChatRoom findDirectRoom(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    // 메시지
    List<ChatMessage> findMessages(@Param("roomId") Long roomId,
                                    @Param("before") Long before,
                                    @Param("limit") int limit);
    void insertMessage(ChatMessage message);

    // 미읽은 메시지 수
    int countUnreadMessages(@Param("roomId") Long roomId, @Param("userId") Long userId);
}
