package com.groupware.service;

import com.groupware.dto.response.DepartmentResponse;
import com.groupware.dto.response.EmployeeResponse;
import com.groupware.dto.response.PositionResponse;
import com.groupware.entity.Board;
import com.groupware.entity.Department;
import com.groupware.entity.MeetingRoom;
import com.groupware.mapper.AdminMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 관리자 서비스
 * 사용자/부서/직급/게시판/회의실 관리, 통계 제공
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminMapper adminMapper;

    // ========== 사용자 관리 ==========

    public List<EmployeeResponse> getAllUsers(String search) {
        return adminMapper.findAllUsersForAdmin(search);
    }

    @Transactional
    public void updateUserProfile(Long userId, Long departmentId, Long positionId,
                                  String phone, String joinedDate) {
        adminMapper.upsertUserProfile(userId, departmentId, positionId, phone, joinedDate);
    }

    // ========== 부서 관리 ==========

    public List<DepartmentResponse> getAllDepartments() {
        return adminMapper.findAllDepartmentsForAdmin();
    }

    @Transactional
    public Department createDepartment(Department department) {
        adminMapper.insertDepartment(department);
        return department;
    }

    @Transactional
    public boolean updateDepartment(Long id, Department department) {
        Department existing = adminMapper.findDepartmentEntityById(id);
        if (existing == null) return false;
        department.setId(id);
        adminMapper.updateDepartment(department);
        return true;
    }

    @Transactional
    public boolean deleteDepartment(Long id) {
        Department existing = adminMapper.findDepartmentEntityById(id);
        if (existing == null) return false;
        adminMapper.deleteDepartment(id);
        return true;
    }

    // ========== 직급 관리 ==========

    public List<PositionResponse> getAllPositions() {
        return adminMapper.findAllPositionsForAdmin();
    }

    @Transactional
    public void createPosition(String name, int level, int approvalRank) {
        adminMapper.insertPosition(name, level, approvalRank);
    }

    @Transactional
    public void updatePosition(Long id, String name, int level, int approvalRank) {
        adminMapper.updatePosition(id, name, level, approvalRank);
    }

    // ========== 게시판 관리 ==========

    public List<Board> getAllBoards() {
        return adminMapper.findAllBoardsForAdmin();
    }

    @Transactional
    public Board createBoard(Board board) {
        adminMapper.insertBoard(board);
        return board;
    }

    @Transactional
    public void updateBoard(Long id, Board board) {
        board.setId(id);
        adminMapper.updateBoard(board);
    }

    @Transactional
    public void deleteBoard(Long id) {
        adminMapper.deleteBoard(id);
    }

    // ========== 회의실 관리 ==========

    public List<MeetingRoom> getAllMeetingRooms() {
        return adminMapper.findAllMeetingRooms();
    }

    @Transactional
    public MeetingRoom createMeetingRoom(MeetingRoom room) {
        adminMapper.insertMeetingRoom(room);
        return room;
    }

    @Transactional
    public void updateMeetingRoom(Long id, MeetingRoom room) {
        room.setId(id);
        adminMapper.updateMeetingRoom(room);
    }

    @Transactional
    public void deleteMeetingRoom(Long id) {
        adminMapper.deleteMeetingRoom(id);
    }

    // ========== 통계 ==========

    public Map<String, Object> getAdminStats() {
        return adminMapper.getAdminStats();
    }
}
