// src/api/client.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api",          // 已在 vite.config.ts 設 proxy 就用這個
  withCredentials: false,   // 若改用 Cookie Session 再設為 true
});

// 若有用 JWT，把 token 自動夾在每個請求上（可先不管）
api.interceptors.request.use((config) => {
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

export default api;
