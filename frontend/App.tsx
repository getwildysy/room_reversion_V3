import React, { JSX } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Header from "./components/Header";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import MainPage from "./pages/MainPage";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App: React.FC = () => {
  // ★★★ 修改 1: 我們需要在這裡也取得 user 物件 ★★★
  const { user, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        載入中...
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <Header />

      <Routes>
        {/* ★★★ 修改 2: 檢查 user 是否存在 ★★★ */}
        {/* 如果 user 存在 (已登入)，就導向首頁，否則才顯示登入頁 */}
        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : <AuthPage />}
        />

        {/* 管理後台 (必須是 Admin) */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />

        {/* 首頁 (必須登入) */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          }
        />

        {/* 預設導向 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

export default App;
