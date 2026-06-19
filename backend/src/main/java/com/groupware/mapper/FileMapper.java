package com.groupware.mapper;

import com.groupware.entity.FileInfo;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FileMapper {

    List<FileInfo> findFiles(@Param("parentId") Long parentId,
                              @Param("departmentId") Long departmentId,
                              @Param("ownerId") Long ownerId);

    List<FileInfo> findSharedFiles(@Param("userId") Long userId);

    FileInfo findById(@Param("id") Long id);

    void insert(FileInfo fileInfo);

    void update(FileInfo fileInfo);

    void softDelete(@Param("id") Long id);
}
