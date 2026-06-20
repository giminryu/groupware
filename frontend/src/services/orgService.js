import api from './api';

/* ===== Mock 데이터 (백엔드 미준비 시 사용) ===== */
export const MOCK_DEPARTMENTS = [
  { id: 1, name: '경영지원팀', memberCount: 5, children: [] },
  { id: 2, name: '개발팀', memberCount: 8, children: [] },
  { id: 3, name: '운영팀', memberCount: 4, children: [] },
  { id: 4, name: '영업팀', memberCount: 6, children: [] },
  { id: 5, name: 'HR팀', memberCount: 3, children: [] },
];

export const MOCK_EMPLOYEES = [
  { id: 1, name: '홍길동', position: '부장', department: '경영지원팀', departmentId: 1, email: 'hong@company.com', phone: '010-1234-5678', isTeamLeader: true },
  { id: 2, name: '김민지', position: '과장', department: '경영지원팀', departmentId: 1, email: 'kimj@company.com', phone: '010-2345-6789', isTeamLeader: false },
  { id: 3, name: '이수진', position: '대리', department: '경영지원팀', departmentId: 1, email: 'lees@company.com', phone: '010-3456-7890', isTeamLeader: false },
  { id: 4, name: '박준혁', position: '주임', department: '경영지원팀', departmentId: 1, email: 'parkj@company.com', phone: '010-4567-8901', isTeamLeader: false },
  { id: 5, name: '정유나', position: '사원', department: '경영지원팀', departmentId: 1, email: 'jungy@company.com', phone: '010-5678-9012', isTeamLeader: false },

  { id: 6, name: '박민준', position: '부장', department: '개발팀', departmentId: 2, email: 'parkmj@company.com', phone: '010-6789-0123', isTeamLeader: true },
  { id: 7, name: '최수진', position: '과장', department: '개발팀', departmentId: 2, email: 'chois@company.com', phone: '010-7890-1234', isTeamLeader: false },
  { id: 8, name: '강태양', position: '과장', department: '개발팀', departmentId: 2, email: 'kangty@company.com', phone: '010-8901-2345', isTeamLeader: false },
  { id: 9, name: '윤서연', position: '대리', department: '개발팀', departmentId: 2, email: 'yoons@company.com', phone: '010-9012-3456', isTeamLeader: false },
  { id: 10, name: '임도현', position: '대리', department: '개발팀', departmentId: 2, email: 'imd@company.com', phone: '010-0123-4567', isTeamLeader: false },
  { id: 11, name: '신하늘', position: '주임', department: '개발팀', departmentId: 2, email: 'shinh@company.com', phone: '010-1234-5670', isTeamLeader: false },
  { id: 12, name: '오지훈', position: '사원', department: '개발팀', departmentId: 2, email: 'oh@company.com', phone: '010-2345-6781', isTeamLeader: false },
  { id: 13, name: '한다은', position: '사원', department: '개발팀', departmentId: 2, email: 'hand@company.com', phone: '010-3456-7892', isTeamLeader: false },

  { id: 14, name: '서영철', position: '부장', department: '운영팀', departmentId: 3, email: 'seoyc@company.com', phone: '010-4567-8903', isTeamLeader: true },
  { id: 15, name: '백지현', position: '과장', department: '운영팀', departmentId: 3, email: 'baikj@company.com', phone: '010-5678-9014', isTeamLeader: false },
  { id: 16, name: '남기원', position: '대리', department: '운영팀', departmentId: 3, email: 'namk@company.com', phone: '010-6789-0125', isTeamLeader: false },
  { id: 17, name: '류준서', position: '사원', department: '운영팀', departmentId: 3, email: 'ryuj@company.com', phone: '010-7890-1236', isTeamLeader: false },

  { id: 18, name: '고은별', position: '부장', department: '영업팀', departmentId: 4, email: 'koeb@company.com', phone: '010-8901-2347', isTeamLeader: true },
  { id: 19, name: '문재호', position: '과장', department: '영업팀', departmentId: 4, email: 'moonj@company.com', phone: '010-9012-3458', isTeamLeader: false },
  { id: 20, name: '진수아', position: '대리', department: '영업팀', departmentId: 4, email: 'jins@company.com', phone: '010-0123-4569', isTeamLeader: false },
  { id: 21, name: '탁민성', position: '주임', department: '영업팀', departmentId: 4, email: 'takm@company.com', phone: '010-1234-5671', isTeamLeader: false },
  { id: 22, name: '엄지원', position: '사원', department: '영업팀', departmentId: 4, email: 'eomj@company.com', phone: '010-2345-6782', isTeamLeader: false },
  { id: 23, name: '구본석', position: '사원', department: '영업팀', departmentId: 4, email: 'koobs@company.com', phone: '010-3456-7893', isTeamLeader: false },

  { id: 24, name: '심은경', position: '부장', department: 'HR팀', departmentId: 5, email: 'shimek@company.com', phone: '010-4567-8904', isTeamLeader: true },
  { id: 25, name: '유다혜', position: '과장', department: 'HR팀', departmentId: 5, email: 'yoodh@company.com', phone: '010-5678-9015', isTeamLeader: false },
  { id: 26, name: '나현주', position: '사원', department: 'HR팀', departmentId: 5, email: 'nahj@company.com', phone: '010-6789-0126', isTeamLeader: false },
];

const orgService = {
  getDepartments: () => api.get('/organization/departments'),
  getEmployeesByDepartment: (deptId) => api.get(`/organization/departments/${deptId}/employees`),
  getEmployee: (id) => api.get(`/organization/employees/${id}`),
  searchEmployees: (query) => api.get(`/organization/employees/search?q=${encodeURIComponent(query)}`),
};

export default orgService;
