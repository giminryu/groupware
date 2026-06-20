import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/layout/Layout';
import './index.css';

/* ===== 지연 로딩 ===== */
const LoginPage        = lazy(() => import('./pages/LoginPage'));
const DashboardPage    = lazy(() => import('./pages/DashboardPage'));
const OrgChartPage     = lazy(() => import('./pages/organization/OrgChartPage'));
const EmployeePage     = lazy(() => import('./pages/organization/EmployeePage'));
const NoticePage       = lazy(() => import('./pages/notice/NoticePage'));
const NoticeDetailPage = lazy(() => import('./pages/notice/NoticeDetailPage'));
const NoticeFormPage   = lazy(() => import('./pages/notice/NoticeFormPage'));
const BoardPage        = lazy(() => import('./pages/board/BoardPage'));
const PostDetailPage   = lazy(() => import('./pages/board/PostDetailPage'));
const PostFormPage     = lazy(() => import('./pages/board/PostFormPage'));
const SchedulePage     = lazy(() => import('./pages/schedule/SchedulePage'));
const RoomBookingPage  = lazy(() => import('./pages/schedule/RoomBookingPage'));
const FilePage         = lazy(() => import('./pages/files/FilePage'));
const ApprovalPage     = lazy(() => import('./pages/approval/ApprovalPage'));
const ApprovalDetailPage = lazy(() => import('./pages/approval/ApprovalDetailPage'));
const ApprovalFormPage = lazy(() => import('./pages/approval/ApprovalFormPage'));
const MessengerPage    = lazy(() => import('./pages/messenger/MessengerPage'));
const AdminPage        = lazy(() => import('./pages/admin/AdminPage'));
const ProfilePage      = lazy(() => import('./pages/profile/ProfilePage'));
const ItsmPage         = lazy(() => import('./pages/itsm/ItsmPage'));

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: '#0f766e',
      fontSize: '1rem',
      background: '#f0fdfa',
    }}>
      <span style={{ marginRight: '8px', fontSize: '1.4rem' }}>🏢</span>
      로딩 중...
    </div>
  );
}

/* ===== 개발 예정 임시 페이지 ===== */
function ComingSoon({ title, icon }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      color: '#94a3b8',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>{icon}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#475569', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{
        fontSize: '0.875rem',
        background: '#f0fdfa',
        color: '#0f766e',
        border: '1px solid #99f6e4',
        borderRadius: '20px',
        padding: '6px 16px',
        fontWeight: 600,
      }}>
        개발 예정
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* 공개 라우트 */}
            <Route path="/login" element={<LoginPage />} />

            {/* 보호된 라우트 — Layout 포함 (Outlet 사용) */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="organization" element={<OrgChartPage />} />
              <Route path="organization/employee/:id" element={<EmployeePage />} />

              {/* 공지사항 */}
              <Route path="notice"            element={<NoticePage />} />
              <Route path="notice/create"     element={<NoticeFormPage />} />
              <Route path="notice/:id"        element={<NoticeDetailPage />} />
              <Route path="notice/:id/edit"   element={<NoticeFormPage />} />

              {/* 게시판 */}
              <Route path="board"             element={<BoardPage />} />
              <Route path="board/post/:id"    element={<PostDetailPage />} />
              <Route path="board/create"      element={<PostFormPage />} />

              {/* 일정 */}
              <Route path="schedule"          element={<SchedulePage />} />
              <Route path="schedule/rooms"    element={<RoomBookingPage />} />

              {/* 파일공유 */}
              <Route path="files"             element={<FilePage />} />

              {/* 전자결재 */}
              <Route path="approval"         element={<ApprovalPage />} />
              <Route path="approval/create"  element={<ApprovalFormPage />} />
              <Route path="approval/:id"     element={<ApprovalDetailPage />} />

              {/* 메신저 */}
              <Route path="messenger"          element={<MessengerPage />} />
              <Route path="messenger/:roomId"  element={<MessengerPage />} />

              {/* 신규 페이지 */}
              <Route path="admin"     element={<AdminPage />} />
              <Route path="profile"   element={<ProfilePage />} />
              <Route path="itsm"      element={<ItsmPage />} />

              {/* 개발 예정 */}
              <Route path="calendar"  element={<ComingSoon title="일정(구)" icon="📅" />} />
            </Route>

            {/* 기본 리다이렉트 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
