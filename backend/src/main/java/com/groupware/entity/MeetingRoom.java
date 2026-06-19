package com.groupware.entity;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MeetingRoom {
    private Long id;
    private String name;
    private Integer capacity;
    private String location;
    private String description;
    private LocalDateTime createdAt;
}
