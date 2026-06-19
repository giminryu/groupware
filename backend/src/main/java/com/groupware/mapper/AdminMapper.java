package com.groupware.mapper;

import com.groupware.dto.response.DepartmentResponse;
import com.groupware.dto.response.EmployeeResponse;
import com.groupware.dto.response.PositionResponse;
import com.groupware.entity.Board;
import com.groupware.entity.Department;
import com.groupware.entity.MeetingRoom;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

/**
 * 관리자 매퍼
 * 사용자 관리, 부서/직급/게시판/회의실 CRUD, 통계 조회
 */
@Mapper
public interface AdminMapper {

    // ========== 사용자 관리 ==========

    /** 전체 사용자 목록 (itsm_users LEFT JOIN gw_user_profiles) */
    List<EmployeeResponse> findAllUsersForAdmin(@Param("search") String search);

    /** 사용자 프로필 업데이트 (부서, 직급, 입사일) */
    void upsertUserProfile(@Param("userId") Long userId,
                           @Param("departmentId") Long departmentId,
                           @Param("positionId") Long positionId,
                           @Param("phone") String phone,
                           @Param("joinedDate") String joinedDate);

    // ========== 부서 관리 ==========

    List<DepartmentResponse> findAllDepartmentsForAdmin();

    void insertDepartment(Department department);

    void updateDepartment(Department department);

    void deleteDepartment(@Param("id") Long id);

    Department findDepartmentEntityById(@Param("id") Long id);

    // ========== 직급 관리 ==========

    List<PositionResponse> findAllPositionsForAdmin();

    void insertPosition(@Param("name") String name, @Param("level") int level, @Param("approvalRank") int approvalRank);

    void updatePosition(@Param("id") Long id, @Param("name") String name, @Param("level") int level, @Param("approvalRank") int approvalRank);

    // ========== 게시판 관리 ==========

    List<Board> findAllBoardsForAdmin();

    void insertBoard(Board board);

    void updateBoard(Board board);

    void deleteBoard(@Param("id") Long id);

    // ========== 회의실 관리 ==========

    List<MeetingRoom> findAllMeetingRooms();

    void insertMeetingRoom(MeetingRoom room);

    void updateMeetingRoom(MeetingRoom room);

    void deleteMeetingRoom(@Param("id") Long id);

    /** 프로필 이미지 경로 업데이트 */
    void updateProfileImagePath(@Param("userId") Long userId, @Param("imagePath") String imagePath);

    // ========== 통계 ==========

    Map<String, Object> getAdminStats();
}
