package com.groupware.config;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.context.annotation.Configuration;

/**
 * MyBatis 설정
 * mapper 패키지 자동 스캔
 */
@Configuration
@MapperScan("com.groupware.mapper")
public class MyBatisConfig {
}
