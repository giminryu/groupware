package com.groupware.common;

/**
 * 그룹웨어 애플리케이션 전역 상수
 */
public class Constants {

    public static class Jwt {
        public static final String HEADER = "Authorization";
        public static final String PREFIX = "Bearer ";
        public static final String CLAIM_USER_ID = "userId";
        public static final String CLAIM_USERNAME = "username";
        public static final String CLAIM_ROLE = "role";
    }

    public static class Role {
        public static final String ADMIN = "ADMIN";
        public static final String AGENT = "AGENT";
        public static final String USER = "USER";
    }
}
