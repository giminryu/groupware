package com.groupware.mapper;

import com.groupware.entity.ItsmUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**
 * ITSM 사용자 매퍼 (읽기 전용)
 * itsm_users 테이블 조회만 허용
 */
@Mapper
public interface UserMapper {

    @Select("SELECT id, username, password_hash, name, email, role, department, active FROM itsm_users WHERE username = #{username}")
    ItsmUser findByUsername(String username);

    @Select("SELECT id, username, password_hash, name, email, role, department, active FROM itsm_users WHERE id = #{id}")
    ItsmUser findById(Long id);
}
