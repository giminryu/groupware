-- ===== 전자결재 =====
CREATE TABLE IF NOT EXISTS gw_approval_templates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    form_fields JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gw_approval_documents (
    id BIGSERIAL PRIMARY KEY,
    template_id BIGINT REFERENCES gw_approval_templates(id),
    document_type VARCHAR(50) NOT NULL DEFAULT 'CUSTOM',
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    form_data JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    applicant_id BIGINT NOT NULL REFERENCES itsm_users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    submitted_at TIMESTAMP,
    completed_at TIMESTAMP,
    rejection_reason TEXT
);

CREATE TABLE IF NOT EXISTS gw_approval_lines (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES gw_approval_documents(id) ON DELETE CASCADE,
    approver_id BIGINT NOT NULL REFERENCES itsm_users(id),
    sequence INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    approved_at TIMESTAMP,
    comment TEXT,
    delegated_to BIGINT REFERENCES itsm_users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gw_approval_history (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES gw_approval_documents(id),
    action VARCHAR(50) NOT NULL,
    actor_id BIGINT NOT NULL REFERENCES itsm_users(id),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===== 메신저 =====
CREATE TABLE IF NOT EXISTS gw_chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    room_type VARCHAR(20) NOT NULL DEFAULT 'DIRECT',
    created_by BIGINT NOT NULL REFERENCES itsm_users(id),
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gw_chat_room_members (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES gw_chat_rooms(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES itsm_users(id),
    joined_at TIMESTAMP DEFAULT NOW(),
    last_read_at TIMESTAMP,
    is_muted BOOLEAN DEFAULT FALSE,
    UNIQUE(room_id, user_id)
);

CREATE TABLE IF NOT EXISTS gw_messages (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES gw_chat_rooms(id),
    sender_id BIGINT NOT NULL REFERENCES itsm_users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'TEXT',
    edited_at TIMESTAMP,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===== 알림 =====
CREATE TABLE IF NOT EXISTS gw_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES itsm_users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    related_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===== 초기 데이터 =====
INSERT INTO gw_approval_templates (name, document_type, form_fields) VALUES
('휴가 신청서', 'VACATION', '[{"name":"vacationType","label":"휴가 유형","type":"select","options":["연차","반차","병가"],"required":true},{"name":"startDate","label":"시작일","type":"date","required":true},{"name":"endDate","label":"종료일","type":"date","required":true},{"name":"reason","label":"사유","type":"textarea","required":false}]'),
('지출 결의서', 'EXPENSE', '[{"name":"amount","label":"금액","type":"number","required":true},{"name":"purpose","label":"사용 목적","type":"text","required":true},{"name":"expenseDate","label":"지출일","type":"date","required":true}]'),
('업무 보고서', 'REPORT', '[{"name":"period","label":"보고 기간","type":"text","required":true},{"name":"summary","label":"업무 요약","type":"textarea","required":true}]'),
('일반 결재', 'CUSTOM', '[]')
ON CONFLICT DO NOTHING;
