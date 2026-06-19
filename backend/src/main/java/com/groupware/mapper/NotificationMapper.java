package com.groupware.mapper;

import com.groupware.entity.Notification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface NotificationMapper {

    List<Notification> findByUserId(@Param("userId") Long userId, @Param("unreadOnly") boolean unreadOnly);
    Notification findById(@Param("id") Long id);
    void insert(Notification notification);
    void markAsRead(@Param("id") Long id);
    void markAllAsRead(@Param("userId") Long userId);
    int countUnread(@Param("userId") Long userId);
}
