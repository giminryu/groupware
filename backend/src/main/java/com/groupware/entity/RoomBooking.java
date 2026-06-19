package com.groupware.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoomBooking {
    private Long id;
    private Long roomId;
    private Long scheduleId;
    private Long bookedBy;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
    private LocalDateTime createdAt;
    // JOIN 필드
    private String bookedByName;
    private String roomName;
}
