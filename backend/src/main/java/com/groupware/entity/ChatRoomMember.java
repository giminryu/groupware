package com.groupware.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChatRoomMember {
    private Long id;
    private Long roomId;
    private Long userId;
    private LocalDateTime joinedAt;
    private LocalDateTime lastReadAt;
    private Boolean isMuted;
    // JOIN
    private String userName;
    private String userDepartment;
    private String userPosition;
}
