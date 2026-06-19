-- 그룹웨어 DB 스키마 (Phase 1)
-- itsm_users 테이블은 이미 존재 (수정 금지, 읽기 전용 참조)

-- 부서 테이블
CREATE TABLE IF NOT EXISTS gw_departments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    parent_id BIGINT REFERENCES gw_departments(id),
    manager_id BIGINT REFERENCES itsm_users(id),
    contact VARCHAR(20),
    location VARCHAR(255),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 직급 테이블
CREATE TABLE IF NOT EXISTS gw_positions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    level INT NOT NULL,
    approval_rank INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 사용자 확장 정보 (itsm_users를 참조)
CREATE TABLE IF NOT EXISTS gw_user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES itsm_users(id),
    department_id BIGINT REFERENCES gw_departments(id),
    position_id BIGINT REFERENCES gw_positions(id),
    phone VARCHAR(20),
    profile_image_path VARCHAR(500),
    joined_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 팀 테이블
CREATE TABLE IF NOT EXISTS gw_teams (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id BIGINT NOT NULL REFERENCES gw_departments(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 팀 멤버
CREATE TABLE IF NOT EXISTS gw_team_members (
    id BIGSERIAL PRIMARY KEY,
    team_id BIGINT NOT NULL REFERENCES gw_teams(id),
    user_id BIGINT NOT NULL REFERENCES itsm_users(id),
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);
