package com.groupware.service;

import com.groupware.dto.request.RoomBookingRequest;
import com.groupware.dto.request.ScheduleRequest;
import com.groupware.entity.MeetingRoom;
import com.groupware.entity.RoomBooking;
import com.groupware.entity.Schedule;
import com.groupware.mapper.ScheduleMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleMapper scheduleMapper;

    public List<Schedule> getMySchedules(Long userId, LocalDateTime start, LocalDateTime end) {
        List<Schedule> schedules = scheduleMapper.findMySchedules(userId, start, end);
        for (Schedule s : schedules) {
            s.setAttendeeIds(scheduleMapper.findAttendeeIds(s.getId()));
        }
        return schedules;
    }

    public List<Schedule> getTeamSchedules(Long userId, LocalDateTime start, LocalDateTime end) {
        return scheduleMapper.findTeamSchedules(userId, start, end);
    }

    public Schedule getScheduleDetail(Long id) {
        Schedule schedule = scheduleMapper.findById(id);
        if (schedule != null) {
            schedule.setAttendeeIds(scheduleMapper.findAttendeeIds(id));
        }
        return schedule;
    }

    @Transactional
    public Schedule createSchedule(ScheduleRequest request, Long ownerId) {
        Schedule schedule = new Schedule();
        schedule.setTitle(request.getTitle());
        schedule.setDescription(request.getDescription());
        schedule.setOwnerId(ownerId);
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setLocation(request.getLocation());
        schedule.setIsAllDay(request.getIsAllDay());
        schedule.setVisibility(request.getVisibility());
        schedule.setColor(request.getColor());
        scheduleMapper.insert(schedule);

        if (request.getAttendeeIds() != null) {
            for (Long attendeeId : request.getAttendeeIds()) {
                scheduleMapper.insertAttendee(schedule.getId(), attendeeId);
            }
        }

        // 회의실 예약 처리
        if (request.getRoomId() != null) {
            boolean conflict = scheduleMapper.existsConflictBooking(
                    request.getRoomId(), request.getStartTime(), request.getEndTime(), null);
            if (conflict) {
                throw new RuntimeException("해당 시간에 이미 예약된 회의실입니다");
            }
            RoomBooking booking = new RoomBooking();
            booking.setRoomId(request.getRoomId());
            booking.setScheduleId(schedule.getId());
            booking.setBookedBy(ownerId);
            booking.setStartTime(request.getStartTime());
            booking.setEndTime(request.getEndTime());
            booking.setPurpose(request.getRoomPurpose());
            scheduleMapper.insertBooking(booking);
        }

        return getScheduleDetail(schedule.getId());
    }

    @Transactional
    public Schedule updateSchedule(Long id, ScheduleRequest request, Long currentUserId) {
        Schedule schedule = scheduleMapper.findById(id);
        if (schedule == null) return null;
        if (!schedule.getOwnerId().equals(currentUserId)) {
            throw new RuntimeException("수정 권한이 없습니다");
        }

        schedule.setTitle(request.getTitle());
        schedule.setDescription(request.getDescription());
        schedule.setStartTime(request.getStartTime());
        schedule.setEndTime(request.getEndTime());
        schedule.setLocation(request.getLocation());
        schedule.setIsAllDay(request.getIsAllDay());
        schedule.setVisibility(request.getVisibility());
        schedule.setColor(request.getColor());
        scheduleMapper.update(schedule);

        scheduleMapper.deleteAttendees(id);
        if (request.getAttendeeIds() != null) {
            for (Long attendeeId : request.getAttendeeIds()) {
                scheduleMapper.insertAttendee(id, attendeeId);
            }
        }

        return getScheduleDetail(id);
    }

    @Transactional
    public boolean deleteSchedule(Long id, Long currentUserId) {
        Schedule schedule = scheduleMapper.findById(id);
        if (schedule == null) return false;
        if (!schedule.getOwnerId().equals(currentUserId)) {
            throw new RuntimeException("삭제 권한이 없습니다");
        }
        scheduleMapper.delete(id);
        return true;
    }

    public List<MeetingRoom> getAllRooms() {
        return scheduleMapper.findAllRooms();
    }

    public List<RoomBooking> getRoomBookings(Long roomId, LocalDateTime start, LocalDateTime end) {
        return scheduleMapper.findBookingsByRoom(roomId, start, end);
    }

    @Transactional
    public RoomBooking bookRoom(Long roomId, RoomBookingRequest request, Long userId) {
        boolean conflict = scheduleMapper.existsConflictBooking(
                roomId, request.getStartTime(), request.getEndTime(), null);
        if (conflict) {
            throw new RuntimeException("해당 시간에 이미 예약된 회의실입니다");
        }
        RoomBooking booking = new RoomBooking();
        booking.setRoomId(roomId);
        booking.setScheduleId(request.getScheduleId());
        booking.setBookedBy(userId);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        scheduleMapper.insertBooking(booking);
        return scheduleMapper.findBookingById(booking.getId());
    }

    @Transactional
    public boolean cancelBooking(Long id, Long currentUserId) {
        RoomBooking booking = scheduleMapper.findBookingById(id);
        if (booking == null) return false;
        if (!booking.getBookedBy().equals(currentUserId)) {
            throw new RuntimeException("취소 권한이 없습니다");
        }
        scheduleMapper.deleteBooking(id);
        return true;
    }
}
