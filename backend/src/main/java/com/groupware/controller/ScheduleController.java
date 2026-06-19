package com.groupware.controller;

import com.groupware.common.ApiResponse;
import com.groupware.dto.request.RoomBookingRequest;
import com.groupware.dto.request.ScheduleRequest;
import com.groupware.entity.MeetingRoom;
import com.groupware.entity.RoomBooking;
import com.groupware.entity.Schedule;
import com.groupware.security.UserPrincipal;
import com.groupware.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    private Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal) {
            return ((UserPrincipal) auth.getPrincipal()).getUserId();
        }
        return null;
    }

    /**
     * 내 일정 목록
     * GET /api/schedules?start=&end=&userId=
     */
    @GetMapping("/api/schedules")
    public ResponseEntity<ApiResponse<List<Schedule>>> getSchedules(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) Long userId) {
        Long currentUserId = userId != null ? userId : getCurrentUserId();
        List<Schedule> schedules = scheduleService.getMySchedules(currentUserId, start, end);
        return ResponseEntity.ok(ApiResponse.success("일정 목록 조회 성공", schedules));
    }

    /**
     * 일정 상세 조회
     * GET /api/schedules/{id}
     */
    @GetMapping("/api/schedules/{id}")
    public ResponseEntity<ApiResponse<Schedule>> getScheduleDetail(@PathVariable Long id) {
        Schedule schedule = scheduleService.getScheduleDetail(id);
        if (schedule == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(ApiResponse.success("일정 조회 성공", schedule));
    }

    /**
     * 일정 생성
     * POST /api/schedules
     */
    @PostMapping("/api/schedules")
    public ResponseEntity<ApiResponse<Schedule>> createSchedule(@RequestBody ScheduleRequest request) {
        Long userId = getCurrentUserId();
        try {
            Schedule schedule = scheduleService.createSchedule(request, userId);
            return ResponseEntity.ok(ApiResponse.success("일정 생성 성공", schedule));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 일정 수정
     * PUT /api/schedules/{id}
     */
    @PutMapping("/api/schedules/{id}")
    public ResponseEntity<ApiResponse<Schedule>> updateSchedule(@PathVariable Long id,
                                                                  @RequestBody ScheduleRequest request) {
        Long userId = getCurrentUserId();
        try {
            Schedule schedule = scheduleService.updateSchedule(id, request, userId);
            if (schedule == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(ApiResponse.success("일정 수정 성공", schedule));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 일정 삭제
     * DELETE /api/schedules/{id}
     */
    @DeleteMapping("/api/schedules/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        try {
            boolean deleted = scheduleService.deleteSchedule(id, userId);
            if (!deleted) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(ApiResponse.success("일정 삭제 성공"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 팀/부서 공개 일정
     * GET /api/schedules/team
     */
    @GetMapping("/api/schedules/team")
    public ResponseEntity<ApiResponse<List<Schedule>>> getTeamSchedules(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        Long userId = getCurrentUserId();
        List<Schedule> schedules = scheduleService.getTeamSchedules(userId, start, end);
        return ResponseEntity.ok(ApiResponse.success("팀 일정 목록 조회 성공", schedules));
    }

    /**
     * 회의실 목록
     * GET /api/meeting-rooms
     */
    @GetMapping("/api/meeting-rooms")
    public ResponseEntity<ApiResponse<List<MeetingRoom>>> getMeetingRooms() {
        List<MeetingRoom> rooms = scheduleService.getAllRooms();
        return ResponseEntity.ok(ApiResponse.success("회의실 목록 조회 성공", rooms));
    }

    /**
     * 회의실 예약 현황
     * GET /api/meeting-rooms/{id}/bookings
     */
    @GetMapping("/api/meeting-rooms/{id}/bookings")
    public ResponseEntity<ApiResponse<List<RoomBooking>>> getRoomBookings(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end) {
        List<RoomBooking> bookings = scheduleService.getRoomBookings(id, start, end);
        return ResponseEntity.ok(ApiResponse.success("회의실 예약 현황 조회 성공", bookings));
    }

    /**
     * 회의실 예약
     * POST /api/meeting-rooms/{id}/bookings
     */
    @PostMapping("/api/meeting-rooms/{id}/bookings")
    public ResponseEntity<ApiResponse<RoomBooking>> bookRoom(@PathVariable Long id,
                                                               @RequestBody RoomBookingRequest request) {
        Long userId = getCurrentUserId();
        try {
            RoomBooking booking = scheduleService.bookRoom(id, request, userId);
            return ResponseEntity.ok(ApiResponse.success("회의실 예약 성공", booking));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 회의실 예약 취소
     * DELETE /api/room-bookings/{id}
     */
    @DeleteMapping("/api/room-bookings/{id}")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        try {
            boolean cancelled = scheduleService.cancelBooking(id, userId);
            if (!cancelled) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(ApiResponse.success("예약 취소 성공"));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(ApiResponse.error(e.getMessage()));
        }
    }
}
