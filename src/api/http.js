// src/api/http.js
// 只有以 VITE_ 開頭的變數會被 Vite 暴露到前端
export const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

// ===== fetch 版 =====
export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// ===== axios 版（如果你用 axios）=====
// import axios from "axios";
// export const http = axios.create({
//   baseURL: API_BASE,
//   withCredentials: true,
// });
