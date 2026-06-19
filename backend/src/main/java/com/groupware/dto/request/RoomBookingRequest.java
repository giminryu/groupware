package com.groupware.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class RoomBookingRequest {
    private Long scheduleId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String purpose;
}
