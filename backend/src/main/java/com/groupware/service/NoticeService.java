package com.groupware.service;

import com.groupware.dto.request.NoticeRequest;
import com.groupware.entity.Notice;
import com.groupware.mapper.NoticeMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeMapper noticeMapper;

    public Map<String, Object> getNotices(int page, int size, String search, Long currentUserId) {
        int offset = page * size;
        List<Notice> notices = noticeMapper.findAll(search, offset, size, currentUserId);
        int total = noticeMapper.countAll(search);

        Map<String, Object> result = new HashMap<>();
        result.put("content", notices);
        result.put("totalElements", total);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    @Transactional
    public Notice getNoticeDetail(Long id, Long currentUserId) {
        Notice notice = noticeMapper.findById(id, currentUserId);
        if (notice == null) return null;
        // 조회수 증가
        noticeMapper.incrementViewCount(id);
        notice.setViewCount(notice.getViewCount() + 1);
        return notice;
    }

    @Transactional
    public Notice createNotice(NoticeRequest request, Long authorId) {
        Notice notice = new Notice();
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setAuthorId(authorId);
        notice.setVisibility(request.getVisibility());
        notice.setViewRequired(request.getViewRequired());
        noticeMapper.insert(notice);
        return noticeMapper.findById(notice.getId(), authorId);
    }

    @Transactional
    public Notice updateNotice(Long id, NoticeRequest request) {
        Notice notice = noticeMapper.findById(id, null);
        if (notice == null) return null;
        notice.setTitle(request.getTitle());
        notice.setContent(request.getContent());
        notice.setVisibility(request.getVisibility());
        notice.setViewRequired(request.getViewRequired());
        noticeMapper.update(notice);
        return noticeMapper.findById(id, null);
    }

    @Transactional
    public boolean deleteNotice(Long id) {
        Notice notice = noticeMapper.findById(id, null);
        if (notice == null) return false;
        noticeMapper.delete(id);
        return true;
    }

    @Transactional
    public boolean markViewed(Long noticeId, Long userId) {
        Notice notice = noticeMapper.findById(noticeId, userId);
        if (notice == null) return false;
        noticeMapper.insertView(noticeId, userId);
        return true;
    }
}
