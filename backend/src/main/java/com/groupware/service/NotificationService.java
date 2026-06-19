package com.groupware.service;

import com.groupware.entity.Notification;
import com.groupware.mapper.NotificationMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationMapper notificationMapper;

    public List<Notification> getNotifications(Long userId, boolean unreadOnly) {
        return notificationMapper.findByUserId(userId, unreadOnly);
    }

    public int getUnreadCount(Long userId) {
        return notificationMapper.countUnread(userId);
    }

    @Transactional
    public void sendNotification(Long userId, String type, String title, String message, Long relatedId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRelatedId(relatedId);
        notificationMapper.insert(notification);
        log.info("알림 전송: userId={}, type={}, title={}", userId, type, title);
    }

    @Transactional
    public boolean markAsRead(Long id, Long userId) {
        Notification notification = notificationMapper.findById(id);
        if (notification == null || !notification.getUserId().equals(userId)) {
            return false;
        }
        notificationMapper.markAsRead(id);
        return true;
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationMapper.markAllAsRead(userId);
    }
}
