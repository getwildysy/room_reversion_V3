import React from "react";
import { useAuth } from "../AuthContext";
import { Link, useNavigate } from "react-router-dom"; // 1. 匯入 Link 和 useNavigate

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate(); // 2. 取得導航函式

  const handleLogout = () => {
    logout();
    navigate("/auth"); // 3. 登出後自動導向到登入頁
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* 4. 將標題變成一個 Link，點擊可回首頁 */}
          <Link to="/" className="text-2xl font-bold text-gray-900">
            新明國中專科教室預約系統
          </Link>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-gray-700">你好, {user.nickname}</span>

                {user.role === "admin" && (
                  // 5. 將按鈕改成 Link，導向到 /admin
                  <Link
                    to="/admin"
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700"
                  >
                    管理後台
                  </Link>
                )}

                <button
                  onClick={handleLogout} // 6. 使用新的登出函式
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-semibold hover:bg-red-700"
                >
                  登出
                </button>
              </>
            ) : (
              <Link to="/auth" className="text-blue-600 hover:underline">
                登入 / 註冊
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
