<template>
  <div class="page">
    <!-- 頂部導覽列 -->
    <header class="topbar">
      <div class="left">
        <RouterLink to="/" class="logo">⛩️ {{ templeName }}</RouterLink>
        <nav class="nav">
          <RouterLink to="/">首頁</RouterLink>
          <RouterLink to="/omikuji">抽籤</RouterLink>
          <RouterLink to="/survey">問卷</RouterLink>
          <RouterLink to="/about">關於</RouterLink>
        </nav>
      </div>

      <div class="right">
        <template v-if="loggedIn">
          <span class="user">Hi，{{ username }}</span>
          <button class="btn" @click="logout">登出</button>
        </template>
        <template v-else>
          <RouterLink class="btn ghost" to="/login">登入</RouterLink>
          <RouterLink class="btn" to="/signup">註冊</RouterLink>
        </template>
      </div>
    </header>

    <!-- 輪播 Banner -->
    <section class="banner" @mouseenter="pause()" @mouseleave="play()">
      <div class="slides" :style="{ transform: `translateX(-${current * 100}%)` }">
        <figure class="slide" v-for="(b, i) in banners" :key="i">
          <img :src="b.src" :alt="b.alt" />
          <figcaption class="caption">
            <!-- <p class="subtitle">{{ b.text }}</p> -->
          </figcaption>
        </figure>
      </div>

      <button class="ctrl prev" @click="prev" aria-label="上一張">‹</button>
      <button class="ctrl next" @click="next" aria-label="下一張">›</button>

      <div class="dots">
        <button
          v-for="(b, i) in banners"
          :key="i"
          :class="['dot', { active: i === current }]"
          @click="go(i)"
          :aria-label="`切到第 ${i + 1} 張`"
        />
      </div>
    </section>

    <!-- 快速入口 -->
    <section class="quick">
      <RouterLink class="card" to="/omikuji">
        <h3>線上抽籤</h3><p>參拜祈福、抽取籤詩</p>
      </RouterLink>
      <RouterLink class="card" to="/survey">
        <h3>問卷回饋</h3><p>留下建議，讓服務更好</p>
      </RouterLink>
      <RouterLink class="card" to="/about">
        <h3>關於宮廟</h3><p>歷史沿革、交通資訊</p>
      </RouterLink>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, RouterLink } from "vue-router";
import b1 from "@/pic/HomeBanner1.jpg";
import b2 from "@/pic/HomeBanner2.jpg";
import b3 from "@/pic/HomeBanner3.jpg";

/**
 * TODO：這裡先用假資料。之後可改成從 /api/temple/ 取回來：
 * const { data } = await api.get('/temple/');
 * templeName.value = data.name
 * banners.value = data.banners
 */
const templeName = ref("測試宮廟");

// 建議把三張圖片放到 /public/banners/ 底下（檔名可自訂）

const banners = ref([
  { src: b1, alt: "宮廟大門", text: "香火鼎盛 · 祈福平安" },
  { src: b2, alt: "主殿與香客", text: "敬天禮神 · 祥和安定" },
  { src: b3, alt: "夜景燈會", text: "燈火通明 · 庇佑眾生" },
]);

const current = ref(0);
let timer = null;

const next = () => (current.value = (current.value + 1) % banners.value.length);
const prev = () =>
  (current.value = (current.value - 1 + banners.value.length) % banners.value.length);
const go = (i) => (current.value = i);

const play = () => {
  stop();
  timer = setInterval(next, 5000);
};
const pause = () => stop();
const stop = () => {
  if (timer) clearInterval(timer);
  timer = null;
};

onMounted(play);
onUnmounted(stop);

// ===== 使用者顯示（簡單版）：用 localStorage 判斷 =====
// 之後可換成 Pinia + 後端 JWT / Session
const username = ref(localStorage.getItem("username") || "訪客");
const loggedIn = computed(() => !!localStorage.getItem("token"));
const router = useRouter();
const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  username.value = "訪客";
  router.push("/login");
};
</script>

<style scoped>
/* Layout 基本款 */
.page { display: flex; flex-direction: column; min-height: 100vh; background: #fafafa; }

/* Topbar */
.topbar {
  position: sticky; top: 0; z-index: 20;
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; background: #ffffffcc; backdrop-filter: blur(6px);
  border-bottom: 1px solid #eee;
}
.topbar .left { display: flex; align-items: center; gap: 24px; }
.logo { font-weight: 800; font-size: 18px; text-decoration: none; color: #333; }
.nav a { margin-right: 16px; text-decoration: none; color: #444; }
.nav a.router-link-active { color: #b45309; font-weight: 700; }
.right { display: flex; align-items: center; gap: 10px; }
.user { color: #333; }
.btn {
  padding: 6px 12px; border-radius: 10px; border: 1px solid #b45309;
  background: #b45309; color: #fff; cursor: pointer;
}
.btn.ghost { background: transparent; color: #b45309; }

/* Banner */
/* 外層容器固定比例 1920:650，最大寬 1920，置中 */
.banner{
  aspect-ratio: 1920 / 650;
  width: 100%;
  max-width: 1920px;   /* 超過就不再放大，避免 1920 圖被拉伸變糊 */
  max-height: 650px;   /* 對應最大高度 */
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}
.slides{ height: 100%; display: flex; transition: transform .6s ease; }
.slide {margin: 0;flex: 0 0 100%;height: 100%;position: relative;}
.slide img{ width:100%; height:100%; object-fit: cover;display: block; } /* 填滿容器 */
.caption {
  position: absolute; inset: 0; display: grid; place-items: center; text-align: center;
  color: #fff; padding: 0 20px;
}
.caption .temple {
  font-size: clamp(28px, 6vw, 56px);
  margin: 0 0 8px 0; text-shadow: 0 3px 10px rgba(0,0,0,.4);
}
.subtitle { font-size: clamp(14px, 2.2vw, 18px); opacity: .9; }

/* 控制鈕與圓點 */
.ctrl {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 40px; height: 40px; border: none; border-radius: 50%;
  background: #ffffff90; color: #333; cursor: pointer; font-size: 24px; line-height: 40px;
}
.prev { left: 12px; } .next { right: 12px; }
.dots { position: absolute; left: 0; right: 0; bottom: 12px; display: flex; gap: 8px; justify-content: center; }
.dot { width: 10px; height: 10px; border-radius: 50%; background: #ffffff80; border: none; cursor: pointer; }
.dot.active { background: #fff; }

/* 快速入口 */
.quick {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px; padding: 24px 16px; max-width: 1080px; margin: 0 auto;
}
.card {
  background: #fff; border: 1px solid #eee; border-radius: 14px; padding: 18px;
  text-decoration: none; color: #333; box-shadow: 0 4px 12px rgba(0,0,0,.04);
  transition: transform .15s ease, box-shadow .15s ease;
}
.card:hover { transform: translateY(-2px); box-shadow: 0 8px 18px rgba(0,0,0,.08); }
.card h3 { margin: 0 0 6px 0; color: #b45309; }
</style>
