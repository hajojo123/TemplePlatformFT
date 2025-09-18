// src/api/omikuji.js
import api from "@/api/client";

// 1) 宮廟清單
export function listTemples() {
  return api.get("/omikuji/temples/").then(r => r.data);
}

// 2) 指定宮廟的籤詩套清單
export function listSets(templeSlug) {
  return api.get(`/omikuji/temples/${encodeURIComponent(templeSlug)}/sets/`)
            .then(r => r.data);
}

// 3) 在指定套內抽籤（只需要 setSlug + body） ← 關鍵
export async function drawLot(setSlug, payload) {
  const url = `/omikuji/sets/${encodeURIComponent(setSlug)}/draw/`;
  // 用 URLSearchParams 做 x-www-form-urlencoded
  const body = new URLSearchParams(payload);
  const { data } = await api.post(url, body.toString(), {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  return data; // { lot, debug }
}

// 4) （可選）列出該套所有籤
export function listLots(setSlug) {
  return api.get(`/omikuji/sets/${encodeURIComponent(setSlug)}/lots/`)
            .then(r => r.data);
}
