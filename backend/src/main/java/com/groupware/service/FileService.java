package com.groupware.service;

import com.groupware.dto.request.FileUpdateRequest;
import com.groupware.dto.request.FolderRequest;
import com.groupware.entity.FileInfo;
import com.groupware.mapper.FileMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileService {

    private final FileMapper fileMapper;

    @Value("${app.upload.path:/app/groupware-uploads}")
    private String uploadPath;

    public List<FileInfo> getFiles(Long parentId, Long departmentId, Long ownerId) {
        return fileMapper.findFiles(parentId, departmentId, ownerId);
    }

    public List<FileInfo> getSharedFiles(Long userId) {
        return fileMapper.findSharedFiles(userId);
    }

    public FileInfo getFileDetail(Long id) {
        return fileMapper.findById(id);
    }

    @Transactional
    public FileInfo uploadFile(MultipartFile file, Long parentId, Long departmentId,
                                String visibility, Long ownerId) throws IOException {
        String originalName = file.getOriginalFilename();
        String storedName = UUID.randomUUID() + "_" + originalName;

        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        Path filePath = uploadDir.resolve(storedName);
        Files.copy(file.getInputStream(), filePath);

        FileInfo fileInfo = new FileInfo();
        fileInfo.setName(originalName);
        fileInfo.setParentId(parentId);
        fileInfo.setOwnerId(ownerId);
        fileInfo.setFileType("FILE");
        fileInfo.setSize(file.getSize());
        fileInfo.setMimeType(file.getContentType());
        fileInfo.setStoragePath(filePath.toString());
        fileInfo.setVisibility(visibility != null ? visibility : "PRIVATE");
        fileInfo.setDepartmentId(departmentId);
        fileMapper.insert(fileInfo);

        return fileMapper.findById(fileInfo.getId());
    }

    @Transactional
    public FileInfo createFolder(FolderRequest request, Long ownerId) {
        FileInfo folder = new FileInfo();
        folder.setName(request.getName());
        folder.setParentId(request.getParentId());
        folder.setOwnerId(ownerId);
        folder.setFileType("FOLDER");
        folder.setVisibility(request.getVisibility());
        folder.setDepartmentId(request.getDepartmentId());
        fileMapper.insert(folder);
        return fileMapper.findById(folder.getId());
    }

    @Transactional
    public FileInfo updateFile(Long id, FileUpdateRequest request, Long currentUserId) {
        FileInfo fileInfo = fileMapper.findById(id);
        if (fileInfo == null) return null;
        if (!fileInfo.getOwnerId().equals(currentUserId)) {
            throw new RuntimeException("수정 권한이 없습니다");
        }
        fileInfo.setName(request.getName());
        fileInfo.setVisibility(request.getVisibility());
        fileInfo.setDepartmentId(request.getDepartmentId());
        fileMapper.update(fileInfo);
        return fileMapper.findById(id);
    }

    @Transactional
    public boolean deleteFile(Long id, Long currentUserId) {
        FileInfo fileInfo = fileMapper.findById(id);
        if (fileInfo == null) return false;
        if (!fileInfo.getOwnerId().equals(currentUserId)) {
            throw new RuntimeException("삭제 권한이 없습니다");
        }
        fileMapper.softDelete(id);
        return true;
    }

    public Resource downloadFile(Long id, Long currentUserId) throws MalformedURLException {
        FileInfo fileInfo = fileMapper.findById(id);
        if (fileInfo == null) return null;
        if (fileInfo.getStoragePath() == null) return null;

        Path filePath = Paths.get(fileInfo.getStoragePath());
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) return null;
        return resource;
    }

    public String getOriginalFileName(Long id) {
        FileInfo fileInfo = fileMapper.findById(id);
        return fileInfo != null ? fileInfo.getName() : "download";
    }
}
