package com.groupware.mapper;

import com.groupware.entity.MeetingRoom;
import com.groupware.entity.RoomBooking;
import com.groupware.entity.Schedule;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ScheduleMapper {

    List<Schedule> findMySchedules(@Param("userId") Long userId,
                                   @Param("start") LocalDateTime start,
                                   @Param("end") LocalDateTime end);

    List<Schedule> findTeamSchedules(@Param("userId") Long userId,
                                     @Param("start") LocalDateTime start,
                                     @Param("end") LocalDateTime end);

    Schedule findById(@Param("id") Long id);

    void insert(Schedule schedule);

    void update(Schedule schedule);

    void delete(@Param("id") Long id);

    void deleteAttendees(@Param("scheduleId") Long scheduleId);

    void insertAttendee(@Param("scheduleId") Long scheduleId, @Param("userId") Long userId);

    List<Long> findAttendeeIds(@Param("scheduleId") Long scheduleId);

    // 회의실
    List<MeetingRoom> findAllRooms();

    MeetingRoom findRoomById(@Param("id") Long id);

    List<RoomBooking> findBookingsByRoom(@Param("roomId") Long roomId,
                                         @Param("start") LocalDateTime start,
                                         @Param("end") LocalDateTime end);

    RoomBooking findBookingById(@Param("id") Long id);

    void insertBooking(RoomBooking booking);

    void deleteBooking(@Param("id") Long id);

    boolean existsConflictBooking(@Param("roomId") Long roomId,
                                   @Param("startTime") LocalDateTime startTime,
                                   @Param("endTime") LocalDateTime endTime,
                                   @Param("excludeId") Long excludeId);
}
