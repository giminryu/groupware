package com.groupware.mapper;

import com.groupware.entity.Board;
import com.groupware.entity.Comment;
import com.groupware.entity.Post;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BoardMapper {

    // 게시판
    List<Board> findAllBoards();

    Board findBoardById(@Param("id") Long id);

    // 게시물
    List<Post> findPostsByBoard(@Param("boardId") Long boardId,
                                @Param("search") String search,
                                @Param("offset") int offset,
                                @Param("limit") int limit);

    int countPostsByBoard(@Param("boardId") Long boardId, @Param("search") String search);

    Post findPostById(@Param("id") Long id);

    void insertPost(Post post);

    void updatePost(Post post);

    void deletePost(@Param("id") Long id);

    void incrementPostViewCount(@Param("id") Long id);

    // 댓글
    List<Comment> findCommentsByPost(@Param("postId") Long postId);

    Comment findCommentById(@Param("id") Long id);

    void insertComment(Comment comment);

    void deleteComment(@Param("id") Long id);
}
