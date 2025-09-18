<script setup>
import { ref, onMounted } from "vue";
import api from "@/api/client";

const items = ref([]);
const error = ref("");

onMounted(async () => {
  try {
    // 先試你有的 API：/api/products/ 或 /api/health/ 之類
    const { data } = await api.get("/products/");
    items.value = data.results ?? data; // 兼容 DRF 分頁或純陣列
  } catch (e) {
    error.value = e?.response?.data?.detail ?? e.message;
  }
});
</script>

<template>
  <router-view />
  <!-- <h1>前端 ↔ 後端連線測試</h1>
  <p v-if="error">錯誤：{{ error }}</p>
  <ul v-else>
    <li v-for="(it, i) in items" :key="it.id ?? i">
      {{ it.name ?? JSON.stringify(it) }}
    </li>
  </ul> -->
</template>
