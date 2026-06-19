package com.groupware.entity;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class Schedule {
    private Long id;
    private String title;
    private String description;
    private Long ownerId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private Boolean isAllDay;
    private String visibility;
    private String color;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // JOIN 필드
    private String ownerName;
    private List<Long> attendeeIds;
    private Long roomId;
    private String roomName;
}
