import axios from "axios";

const API_URL = "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_URL,
});

// ★★★ 關鍵：設定 Axios 的 "攔截器" (Interceptor) ★★★
// 這會在 "每一個" 發送出去的 request 上動手腳
api.interceptors.request.use(
  (config) => {
    // 從 localStorage 讀取 token
    const token = localStorage.getItem("token");

    if (token) {
      // 如果 token 存在，就把它加入到 Authorization header 中
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
