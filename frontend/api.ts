import axios from "axios";

// 確保您在「開發模式」下
const API_URL = "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_URL,
});

// --- 請求攔截器 (不變) ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// --- ★★★ 這是修正的「回應攔截器」 ★★★ ---
api.interceptors.response.use(
  (response) => {
    // 2xx 狀態碼，直接回傳
    return response;
  },
  (error) => {
    // 非 2xx 狀態碼

    if (axios.isAxiosError(error) && error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const originalRequestUrl = error.config.url; // 取得原始請求的 URL

      // ★ 1. 檢查：這是否為「登入失敗」的 401 錯誤？
      // 如果是，我們 "不要" 在這裡處理，我們要把它丟回給 AuthPage.tsx
      if (status === 401 && originalRequestUrl?.endsWith("/auth/login")) {
        return Promise.reject(error);
      }

      // ★ 2. 檢查：這是否為 "其他" 的認證錯誤 (Token 過期或 Token 不存在)？
      // (例如：在主頁面操作時，Token 過期了)
      if (
        status === 401 ||
        (status === 403 && data?.message === "Invalid or expired token.")
      ) {
        // 只有在這種情況下，才執行全域登出
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        alert("您的登入已過期或失效，請重新登入。");

        window.location.href = "/auth";

        // 吞掉這個錯誤，不要讓 .catch() 再次觸發
        return new Promise(() => {});
      }
    }

    // 對於所有 "其他" 錯誤 (例如 404, 409 衝突, 500)
    // 我們將錯誤繼續丟回去，讓元件的 .catch() 去處理
    return Promise.reject(error);
  },
);

export default api;
