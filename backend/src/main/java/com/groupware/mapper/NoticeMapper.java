package com.groupware.mapper;

import com.groupware.entity.Notice;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface NoticeMapper {

    List<Notice> findAll(@Param("search") String search,
                         @Param("offset") int offset,
                         @Param("limit") int limit,
                         @Param("currentUserId") Long currentUserId);

    int countAll(@Param("search") String search);

    Notice findById(@Param("id") Long id, @Param("currentUserId") Long currentUserId);

    void insert(Notice notice);

    void update(Notice notice);

    void delete(@Param("id") Long id);

    void incrementViewCount(@Param("id") Long id);

    void insertView(@Param("noticeId") Long noticeId, @Param("userId") Long userId);

    boolean existsView(@Param("noticeId") Long noticeId, @Param("userId") Long userId);
}
