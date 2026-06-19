package com.groupware.entity;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ChatRoom {
    private Long id;
    private String name;
    private String roomType; // DIRECT, GROUP
    private Long createdBy;
    private Boolean isArchived;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // JOIN
    private List<ChatRoomMember> members;
    private int unreadCount;
    private String lastMessage;
    private LocalDateTime lastMessageAt;
}
