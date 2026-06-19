package com.groupware.dto.request;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ScheduleRequest {
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private Boolean isAllDay = false;
    private String visibility = "PRIVATE";
    private String color = "#0f766e";
    private List<Long> attendeeIds;
    private Long roomId;
    private String roomPurpose;
}
