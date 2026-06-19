package com.groupware.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatMessage {
    private Long id;
    private Long roomId;
    private Long senderId;
    private String content;
    private String messageType; // TEXT, FILE, SYSTEM
    private LocalDateTime editedAt;
    private LocalDateTime deletedAt;
    private LocalDateTime createdAt;
    // JOIN
    private String senderName;
}
