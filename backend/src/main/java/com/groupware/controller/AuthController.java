package com.groupware.controller;

import com.groupware.common.ApiResponse;
import com.groupware.entity.ItsmUser;
import com.groupware.mapper.UserMapper;
import com.groupware.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserMapper userMapper;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ApiResponse<?> login(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        String password = body.get("password");

        ItsmUser user = userMapper.findByUsername(username);
        if (user == null || !user.isActive()) {
            return ApiResponse.error("아이디 또는 비밀번호가 올바르지 않습니다.");
        }
        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            return ApiResponse.error("아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        String accessToken  = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getUsername(), user.getRole());

        Map<String, Object> data = Map.of(
            "accessToken",  accessToken,
            "refreshToken", refreshToken,
            "user", Map.of(
                "id",         user.getId(),
                "username",   user.getUsername(),
                "name",       user.getName(),
                "email",      user.getEmail(),
                "role",       user.getRole(),
                "department", user.getDepartment() != null ? user.getDepartment() : ""
            )
        );
        return ApiResponse.success("로그인 성공", data);
    }

    @PostMapping("/refresh")
    public ApiResponse<?> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        try {
            if (!jwtTokenProvider.validateToken(refreshToken)) {
                return ApiResponse.error("유효하지 않은 토큰입니다.");
            }
            Long userId   = jwtTokenProvider.getUserIdFromToken(refreshToken);
            ItsmUser user = userMapper.findById(userId);
            if (user == null || !user.isActive()) {
                return ApiResponse.error("사용자를 찾을 수 없습니다.");
            }
            String newAccessToken  = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getRole());
            String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId(), user.getUsername(), user.getRole());
            return ApiResponse.success("토큰 갱신 성공", Map.of(
                "accessToken",  newAccessToken,
                "refreshToken", newRefreshToken
            ));
        } catch (Exception e) {
            return ApiResponse.error("토큰 갱신에 실패했습니다.");
        }
    }

    @PostMapping("/logout")
    public ApiResponse<?> logout() {
        return ApiResponse.success("로그아웃 되었습니다.");
    }
}
