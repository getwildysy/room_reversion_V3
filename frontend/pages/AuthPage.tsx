import React, { useState } from "react";
import { useAuth } from "../AuthContext"; // 匯入我們的 Auth Hook
import api from "../api"; // 匯入我們的 api 實例

const AuthPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth(); // 從 Context 取得 login 函式

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // 清除舊錯誤

    const endpoint = isLoginView ? "/auth/login" : "/auth/register";

    try {
      const data = isLoginView
        ? { username, password }
        : { username, password, nickname }; // 註冊時才需要 nickname

      const response = await api.post(endpoint, data);

      if (isLoginView) {
        // 登入成功
        const { token, user } = response.data;
        login(token, user); // 呼叫 context 的 login，這會自動存到 localStorage
      } else {
        // 註冊成功
        // ★★★ 修改：註冊成功後的提示訊息 ★★★
        alert("註冊成功！您的帳號正在等待管理者審核，請耐心等候。");
        setUsername("");
        setPassword("");
        setNickname("");
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("發生未知錯誤，請稍後再試。");
      }
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          專科教室借用系統
        </h1>

        <div className="mb-4 flex border-b">
          <button
            className={`flex-1 py-2 font-semibold ${
              isLoginView
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setIsLoginView(true)}
          >
            登入
          </button>
          <button
            className={`flex-1 py-2 font-semibold ${
              !isLoginView
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }`}
            onClick={() => setIsLoginView(false)}
          >
            註冊
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              使用者名稱
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* --- ★ 4. 新增 Nickname 欄位 (只在註冊時顯示) ★ --- */}
          {!isLoginView && (
            <div>
              <label
                htmlFor="nickname"
                className="block text-sm font-medium text-gray-700"
              >
                暱稱
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="請輸入姓名" // <-- ★ 5. 提示詞 ★
              />
            </div>
          )}

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              密碼
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {isLoginView ? "登入" : "註冊"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthPage;
