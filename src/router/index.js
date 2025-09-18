import { createRouter, createWebHistory } from "vue-router";

const Home = () => import("../views/home/Home.vue");
const OmikujiForm = () => import("../views/omikuji/OmikujiForm.vue");
const OmikujiResult  = () => import("@/views/omikuji/OmikujiResult.vue");
const Survey  = () => import("../views/survey/Index.vue");

export default createRouter({
  history: createWebHistory(),        // 單頁應用常用 history 模式
  routes: [
    { path: "/", component: Home },   // ← 首頁
    { path: "/omikuji", component: OmikujiForm },
    { path: "/omikuji/result", component: OmikujiResult },
    { path: "/survey",  component: Survey },
    { path: "/:pathMatch(.*)*", redirect: "/" }, // 簡單 404 導回首頁（可改成獨立頁）
  ],
});
