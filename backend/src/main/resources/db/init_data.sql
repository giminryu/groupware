-- 그룹웨어 초기 데이터

-- 기본 직급 데이터
INSERT INTO gw_positions (name, level, approval_rank) VALUES
('사원', 1, 1), ('주임', 2, 2), ('대리', 3, 3),
('과장', 4, 4), ('차장', 5, 5), ('부장', 6, 6), ('이사', 7, 7)
ON CONFLICT (name) DO NOTHING;

-- 기본 부서 데이터
INSERT INTO gw_departments (name, sort_order) VALUES
('경영지원팀', 1), ('개발팀', 2), ('운영팀', 3), ('영업팀', 4)
ON CONFLICT (name) DO NOTHING;
