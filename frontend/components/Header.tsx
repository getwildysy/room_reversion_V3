// frontend/components/Header.tsx

import React from "react";
import { useAuth } from "../AuthContext"; // 1. 匯入 useAuth

const Header: React.FC = () => {
  // 2. 從 AuthContext 取得 user 狀態和 logout 函式
  const { user, logout } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {/* 3. 我們使用 flex 來排版 */}
        <div className="flex justify-between items-center">
          {/* 左側：標題 */}
          <h1 className="text-2xl font-bold text-gray-900">專科教室借用系統</h1>

          {/* 右側：使用者資訊和按鈕 */}
          <div className="flex items-center space-x-4">
            {/* 4. 檢查 user 是否存在 (是否已登入) */}
            {user ? (
              <>
                <span className="text-gray-700">你好, {user.username}</span>

                {/* 5. ★★★ 權限控制 ★★★ */}
                {/* 檢查使用者角色是否為 'admin' */}
                {user.role === "admin" && (
                  <button
                    onClick={() => alert("管理後台功能待開發")}
                    className="px-3 py-1 bg-green-600 text-white rounded-md text-sm font-semibold hover:bg-green-700"
                  >
                    管理後台
                  </button>
                )}

                <button
                  onClick={logout} // 呼叫從 Context 拿到的 logout 函式
                  className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-semibold hover:bg-red-700"
                >
                  登出
                </button>
              </>
            ) : (
              {
                /* (如果未來需要，這裡可以放「尚未登入」的狀態) */
              }
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
