// src/api/client.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // 若改用 Cookie Session 再設 true
});

// 自動附上 JWT（有就帶，沒有就跳過）
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// （可選）簡單的錯誤統一處理
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // 401/403 等可在這裡處理
    return Promise.reject(err);
  }
);

export default api;
