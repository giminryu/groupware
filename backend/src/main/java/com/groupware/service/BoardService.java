package com.groupware.service;

import com.groupware.dto.request.CommentRequest;
import com.groupware.dto.request.PostRequest;
import com.groupware.entity.Board;
import com.groupware.entity.Comment;
import com.groupware.entity.Post;
import com.groupware.mapper.BoardMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BoardService {

    private final BoardMapper boardMapper;

    public List<Board> getAllBoards() {
        return boardMapper.findAllBoards();
    }

    public Map<String, Object> getPosts(Long boardId, int page, int size, String search) {
        int offset = page * size;
        List<Post> posts = boardMapper.findPostsByBoard(boardId, search, offset, size);
        int total = boardMapper.countPostsByBoard(boardId, search);

        Map<String, Object> result = new HashMap<>();
        result.put("content", posts);
        result.put("totalElements", total);
        result.put("totalPages", (int) Math.ceil((double) total / size));
        result.put("page", page);
        result.put("size", size);
        return result;
    }

    @Transactional
    public Post getPostDetail(Long id) {
        Post post = boardMapper.findPostById(id);
        if (post == null) return null;
        boardMapper.incrementPostViewCount(id);
        post.setViewCount(post.getViewCount() + 1);
        return post;
    }

    @Transactional
    public Post createPost(Long boardId, PostRequest request, Long authorId) {
        Post post = new Post();
        post.setBoardId(boardId);
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setAuthorId(authorId);
        boardMapper.insertPost(post);
        return boardMapper.findPostById(post.getId());
    }

    @Transactional
    public Post updatePost(Long id, PostRequest request, Long currentUserId) {
        Post post = boardMapper.findPostById(id);
        if (post == null) return null;
        if (!post.getAuthorId().equals(currentUserId)) {
            throw new RuntimeException("수정 권한이 없습니다");
        }
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        boardMapper.updatePost(post);
        return boardMapper.findPostById(id);
    }

    @Transactional
    public boolean deletePost(Long id, Long currentUserId, boolean isAdmin) {
        Post post = boardMapper.findPostById(id);
        if (post == null) return false;
        if (!isAdmin && !post.getAuthorId().equals(currentUserId)) {
            throw new RuntimeException("삭제 권한이 없습니다");
        }
        boardMapper.deletePost(id);
        return true;
    }

    public List<Comment> getComments(Long postId) {
        List<Comment> all = boardMapper.findCommentsByPost(postId);
        return buildCommentTree(all);
    }

    @Transactional
    public Comment createComment(Long postId, CommentRequest request, Long authorId) {
        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setParentId(request.getParentId());
        comment.setAuthorId(authorId);
        comment.setContent(request.getContent());
        boardMapper.insertComment(comment);
        return boardMapper.findCommentById(comment.getId());
    }

    @Transactional
    public boolean deleteComment(Long id, Long currentUserId, boolean isAdmin) {
        Comment comment = boardMapper.findCommentById(id);
        if (comment == null) return false;
        if (!isAdmin && !comment.getAuthorId().equals(currentUserId)) {
            throw new RuntimeException("삭제 권한이 없습니다");
        }
        boardMapper.deleteComment(id);
        return true;
    }

    private List<Comment> buildCommentTree(List<Comment> all) {
        Map<Long, Comment> map = all.stream()
                .peek(c -> c.setChildren(new ArrayList<>()))
                .collect(Collectors.toMap(Comment::getId, c -> c));

        List<Comment> roots = new ArrayList<>();
        for (Comment c : all) {
            if (c.getParentId() == null) {
                roots.add(c);
            } else {
                Comment parent = map.get(c.getParentId());
                if (parent != null) {
                    parent.getChildren().add(c);
                } else {
                    roots.add(c);
                }
            }
        }
        return roots;
    }
}
