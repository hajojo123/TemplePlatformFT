<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useOmikujiStore } from "@/stores/omikuji";
import { listTemples, listSets, drawLot } from "@/api/omikuji";

const router = useRouter();
const store = useOmikujiStore();

const temples = ref([]);  // [{slug,name}]
const sets = ref([]);     // [{slug,name}]
const loading = ref(false);
const error = ref("");

// 進頁面先載宮廟
onMounted(async () => {
  try {
    temples.value = await listTemples();
    if (temples.value.length && !store.form.templeSlug) {
      store.form.templeSlug = temples.value[0].slug;
    }
  } catch (e) {
    error.value = "載入宮廟失敗";
  }
});

// 宮廟變動時載該宮廟的籤詩套
watch(() => store.form.templeSlug, async (slug) => {
  if (!slug) { sets.value = []; store.form.setSlug = ""; return; }
  try {
    sets.value = await listSets(slug);
    if (sets.value.length && !store.form.setSlug) {
      store.form.setSlug = sets.value[0].slug;
    }
  } catch {
    error.value = "載入籤詩套失敗";
  }
}, { immediate: true });

async function submit() {
  error.value = "";
  if (!store.form.setSlug || !store.form.name || !store.form.birthdate) {
    error.value = "請先選擇宮廟、籤詩套，並填姓名與生日";
    return;
  }
  loading.value = true;
  try {
    const res = await drawLot(store.form.setSlug, {
      name: store.form.name,
      birthdate: store.form.birthdate,
      gender: store.form.gender,
      category: store.form.category,
      question: store.form.question || ""
    });
    store.setResult(res.lot);
    store.setDebug(res.debug);
    router.push("/omikuji/result");
  } catch (e) {
    error.value = e?.response?.data?.detail || e.message || "抽籤失敗";
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <section class="wrap">
    <h1>線上求籤</h1>

    <form class="form" @submit.prevent="submit">
      <div class="row">
        <label>宮廟</label>
        <select v-model="store.form.templeSlug">
          <option disabled value="">請選擇</option>
          <option v-for="t in temples" :key="t.slug" :value="t.slug">{{ t.name }}</option>
        </select>
      </div>

      <div class="row">
        <label>籤詩套</label>
        <select v-model="store.form.setSlug">
          <option disabled value="">請選擇</option>
          <option v-for="s in sets" :key="s.slug" :value="s.slug">{{ s.name }}</option>
        </select>
      </div>

      <div class="row">
        <label>姓名</label>
        <input v-model.trim="store.form.name" placeholder="張三" />
      </div>

      <div class="row">
        <label>生日</label>
        <input v-model="store.form.birthdate" type="date" />
      </div>

      <div class="row">
        <label>性別</label>
        <div class="inline">
          <label><input type="radio" value="male"   v-model="store.form.gender" /> 男</label>
          <label><input type="radio" value="female" v-model="store.form.gender" /> 女</label>
          <label><input type="radio" value="other"  v-model="store.form.gender" /> 其他</label>
        </div>
      </div>

      <div class="row">
        <label>問題類型</label>
        <select v-model="store.form.category">
          <option value="love">姻緣</option>
          <option value="wealth">財富</option>
          <option value="career">事業</option>
          <option value="health">健康</option>
          <option value="general">綜合</option>
        </select>
      </div>

      <div class="row">
        <label>問題詳細描述</label>
        <textarea id="detail" name="questiosn" v-model.trim="store.form.question" class="form-control" rows="4" placeholder="請輸入詳細描述（越詳細越好）"></textarea>      </div>
      <p v-if="error" class="err">{{ error }}</p>

      <div class="actions">
        <button class="btn" :disabled="loading">{{ loading ? "求籤中…" : "求籤" }}</button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.wrap { max-width: 720px; margin: 0 auto; padding: 16px; }
.form { display: grid; gap: 14px; background:#fff; border:1px solid #eee; padding:16px; border-radius:12px; }
.row { display:grid; grid-template-columns:110px 1fr; gap:10px; align-items:center; }
.inline { display:flex; gap:12px; }
input, select { padding:8px 10px; border:1px solid #ddd; border-radius:8px; width:100%; }
.actions { text-align:right; }
.btn { padding:8px 16px; border:none; border-radius:10px; background:#b45309; color:#fff; cursor:pointer; }
.err { color:#b91c1c; }
</style>
