// src/stores/omikuji.js
import { defineStore } from "pinia";

export const useOmikujiStore = defineStore("omikuji", {
  state: () => ({
    form: {
      // 路由用
      templeSlug: "",
      setSlug: "",
      // 顯示用（可選）
      templeId: null,
      lotSet: "",

      // 使用者輸入
      name: "",
      birthdate: "",          // yyyy-mm-dd
      gender: "other",        // male | female | other
      category: "general",    // love | wealth | career | health | general
      question: "",           // ← 新增：你 textarea v-model 用這個
    },

    result: null,             // 抽籤結果
    debug: null,              // ← 新增：存後端回傳的除錯資訊
  }),

  getters: {
    isReady: (s) =>
      !!(s.form.templeSlug && s.form.setSlug && s.form.name && s.form.birthdate),

    // POST 給後端的 payload
    drawPayload: (s) => ({
      name: s.form.name,
      birthdate: s.form.birthdate,
      gender: s.form.gender,
      category: s.form.category,
      question: s.form.question || "",   // ← 新增 question
    }),
  },

  actions: {
    setForm(patch) { Object.assign(this.form, patch); },
    setResult(r) { this.result = r; },
    setDebug(d) { this.debug = d; },     // ← 新增

    resetForm() {
      this.form = {
        templeSlug: "", setSlug: "",
        templeId: null, lotSet: "",
        name: "", birthdate: "", gender: "other", category: "general",
        question: "",                    // ← 新增
      };
    },
    reset() { this.resetForm(); this.result = null; this.debug = null; }, // ← 清掉 debug

    // 簡單持久化（可選）
    save() { localStorage.setItem("omikujiStore", JSON.stringify(this.$state)); },
    load() {
      const raw = localStorage.getItem("omikujiStore");
      if (raw) this.$patch(JSON.parse(raw));
    },
  },
});
