package com.groupware.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * Spring Security 인증 주체 커스텀 클래스
 * ITSM의 itsm_users 테이블 기반으로 동작
 */
@Getter
public class UserPrincipal implements UserDetails {

    private final Long userId;
    private final String username;
    private final String password;
    private final String role;
    private final String name;
    private final boolean active;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long userId, String username, String password, String role,
                         String name, boolean active) {
        this.userId = userId;
        this.username = username;
        this.password = password;
        this.role = role;
        this.name = name;
        this.active = active;
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
