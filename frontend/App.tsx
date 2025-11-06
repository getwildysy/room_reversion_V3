import React, { JSX } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Header from "./components/Header";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import MainPage from "./pages/MainPage";
import { Toaster } from "react-hot-toast";

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

      <Toaster
        position="top-center"
        reverseOrder={false}
        // 2. 設定 toastOptions 來自訂樣式
        toastOptions={{
          // A. 設定預設持續時間 (例如 4 秒)
          duration: 4000,

          // B. 全域樣式 (放大字體和 padding，使其更明顯)
          style: {
            background: "#363636", // 深色背景
            color: "#fff", // 白色文字
            padding: "16px", // 增加 padding
            fontSize: "16px", // 放大字體
            borderRadius: "8px",
            minWidth: "250px", // 確保最小寬度
          },

          // C. 針對 "成功" 通知的特定樣式
          success: {
            style: {
              background: "#10B981", // 綠色
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#10B981",
            },
          },

          // D. 針對 "失敗" 通知的特定樣式
          error: {
            style: {
              background: "#EF4444", // 紅色
            },
            iconTheme: {
              primary: "#fff",
              secondary: "#EF4444",
            },
          },
        }}
      />

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
