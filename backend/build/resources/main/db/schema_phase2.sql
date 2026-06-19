-- ===== 공지사항 =====
CREATE TABLE IF NOT EXISTS gw_notices (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL REFERENCES itsm_users(id),
    visibility VARCHAR(20) DEFAULT 'ALL',
    view_required BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gw_notice_views (
    id BIGSERIAL PRIMARY KEY,
    notice_id BIGINT NOT NULL REFERENCES gw_notices(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES itsm_users(id),
    viewed_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(notice_id, user_id)
);

-- ===== 게시판 =====
CREATE TABLE IF NOT EXISTS gw_boards (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    department_id BIGINT REFERENCES gw_departments(id),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gw_posts (
    id BIGSERIAL PRIMARY KEY,
    board_id BIGINT NOT NULL REFERENCES gw_boards(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id BIGINT NOT NULL REFERENCES itsm_users(id),
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gw_comments (
    id BIGSERIAL PRIMARY KEY,
    post_id BIGINT NOT NULL REFERENCES gw_posts(id) ON DELETE CASCADE,
    parent_id BIGINT REFERENCES gw_comments(id),
    author_id BIGINT NOT NULL REFERENCES itsm_users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== 일정관리 =====
CREATE TABLE IF NOT EXISTS gw_schedules (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id BIGINT NOT NULL REFERENCES itsm_users(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    is_all_day BOOLEAN DEFAULT FALSE,
    visibility VARCHAR(20) DEFAULT 'PRIVATE',
    color VARCHAR(20) DEFAULT '#0f766e',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gw_schedule_attendees (
    id BIGSERIAL PRIMARY KEY,
    schedule_id BIGINT NOT NULL REFERENCES gw_schedules(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES itsm_users(id),
    status VARCHAR(20) DEFAULT 'PENDING',
    UNIQUE(schedule_id, user_id)
);

CREATE TABLE IF NOT EXISTS gw_meeting_rooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INT NOT NULL,
    location VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gw_room_bookings (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES gw_meeting_rooms(id),
    schedule_id BIGINT REFERENCES gw_schedules(id),
    booked_by BIGINT NOT NULL REFERENCES itsm_users(id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    purpose VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===== 파일공유 =====
CREATE TABLE IF NOT EXISTS gw_files (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    parent_id BIGINT REFERENCES gw_files(id),
    owner_id BIGINT NOT NULL REFERENCES itsm_users(id),
    file_type VARCHAR(10) DEFAULT 'FILE',
    size BIGINT,
    mime_type VARCHAR(100),
    storage_path VARCHAR(1000),
    visibility VARCHAR(20) DEFAULT 'PRIVATE',
    department_id BIGINT REFERENCES gw_departments(id),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ===== 게시판 초기 데이터 =====
INSERT INTO gw_boards (name, description) VALUES
('자유게시판', '자유롭게 이야기를 나누는 공간입니다'),
('업무공유', '업무 관련 정보를 공유하는 공간입니다'),
('공지사항', '부서별 공지사항 게시판입니다')
ON CONFLICT DO NOTHING;

-- 회의실 초기 데이터
INSERT INTO gw_meeting_rooms (name, capacity, location, description) VALUES
('1회의실', 10, '3층', '프로젝터, 화이트보드'),
('2회의실', 6, '3층', '모니터 2대'),
('대회의실', 30, '2층', '빔프로젝터, 마이크 시스템')
ON CONFLICT DO NOTHING;
