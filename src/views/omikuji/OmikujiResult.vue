<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { useOmikujiStore } from "@/stores/omikuji";

const store = useOmikujiStore();
const router = useRouter();
const r = computed(() => store.result);

// 支援兩種存法：store.debug 或 result._debug
const d = computed(() => store.debug || r.value?._debug || null);

function toSurvey() { router.push("/survey"); }
function back() { router.push("/omikuji"); }
</script>

<template>
  <section class="wrap">
    <h1>抽籤結果</h1>

    <div v-if="r" class="card">
      <div class="head">
        <span class="badge">{{ r.fortune || "吉" }}</span>
        <h2>第 {{ r.number }} 籤 — {{ r.lot_title || r.title || "吉籤" }}</h2>
      </div>
      <pre class="poem" v-if="r.poem">{{ r.poem }}</pre>
      <p v-if="r.interpretation" class="interpretation"><b>解：</b>{{ r.interpretation }}</p>
      <p v-if="r.advice"><b>建議：</b>{{ r.advice }}</p>

      <!-- GPT 進階建議 -->
      <div v-if="r.gpt" class="gpt-block">
        <p v-if="r.gpt.one_line"><b>重點：</b>{{ r.gpt.one_line }}</p>

        <div v-if="r.gpt.actions?.length">
          <b>行動清單：</b>
          <ol>
            <li v-for="(a,i) in r.gpt.actions" :key="'act'+i">{{ a }}</li>
          </ol>
        </div>

        <div v-if="r.gpt.risks?.length">
          <b>風險提醒：</b>
          <ul>
            <li v-for="(x,i) in r.gpt.risks" :key="'risk'+i">{{ x }}</li>
          </ul>
        </div>

        <p v-if="r.gpt.timing"><b>時機：</b>{{ r.gpt.timing.window }}（力度：{{ r.gpt.timing.strength }}）</p>

        <details v-if="r.gpt.other_aspects">
          <summary>其他面向</summary>
          <ul>
            <li><b>感情：</b>{{ r.gpt.other_aspects.love }}</li>
            <li><b>事業：</b>{{ r.gpt.other_aspects.career }}</li>
            <li><b>財富：</b>{{ r.gpt.other_aspects.wealth }}</li>
            <li><b>健康：</b>{{ r.gpt.other_aspects.health }}</li>
          </ul>
        </details>

        <p v-if="r.gpt.keywords?.length" class="tags">
          <b>關鍵字：</b>
          <span v-for="(k,i) in r.gpt.keywords" :key="'kw'+i" class="tag">{{ k }}</span>
        </p>
      </div>

      <!-- Debug 區塊（精簡 + 去重 + 更多保護） -->
      <details v-if="d" class="debug">
        <summary>
          除錯資訊
          <span class="pill" :class="d.gpt_keywords ? 'ok' : 'warn'">關鍵詞 GPT: {{ d.gpt_keywords ? 'ON' : 'OFF' }}</span>
          <span class="pill" :class="d.gpt_rerank ? 'ok' : 'warn'">重排 GPT: {{ d.gpt_rerank ? 'ON' : 'OFF' }}</span>
          <span class="pill">KW: {{ d.kw_model || '-' }}</span>
          <span class="pill">Rerank: {{ d.rank_model || '-' }}</span>
          <span class="pill">選取：{{ d.selection_method || d.selection?.method || '-' }}</span>
          <span v-if="d.rank_error_detail" class="pill err">{{ d.rank_error_detail }}</span>
        </summary>

        <div class="grid">
          <div><b>env_has_key</b>：{{ d.env_has_key ? 'True' : 'False' }}</div>
          <div><b>kw_attempted</b>：{{ d.kw_attempted ?? '-' }}</div>
          <div><b>rank_attempted</b>：{{ d.rank_attempted ?? '-' }}</div>
          <div><b>cands</b>：{{ d.cands ?? 0 }}</div>
          <div><b>kw_model</b>：<code>{{ d.kw_model || '-' }}</code></div>
          <div><b>rank_model</b>：<code>{{ d.rank_model || '-' }}</code></div>
            <!-- 新增：選取方式與最終選中的 id -->
          <div><b>selection.method</b>：{{ d.selection?.method || '-' }}</div>
          <div><b>picked_id</b>：{{ d.selection?.picked_id ?? '-' }}</div>
          <div v-if="d.selection?.top3?.length" class="tablewrap" style="margin-top:8px;">
          <table class="mini" v-if="(d.selection?.top3?.length || d.rerank_preview?.length)">
            <thead><tr><th>rank</th><th>id</th><th>reason</th></tr></thead>
            <tbody>
              <tr v-for="row in (d.selection?.top3 || d.rerank_preview || [])" :key="row.id">
                <td>{{ row.rank }}</td>
                <td>{{ row.id }}</td>
                <td>{{ row.reason || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
          <div class="col-span-2"><b>kw</b>：<code>{{ d.kw }}</code></div>
        </div>

        <!-- 卦象細節 -->
        <div v-if="d.hex" style="margin-top:8px;">
          <b>Hexagram</b>
          <div class="grid">
            <div><b>method</b>：{{ d.hex.method }}</div>
            <div><b>moving</b>：{{ d.hex.moving }}</div>
            <div><b>base</b>：{{ d.hex.base }}</div>
            <div><b>changed</b>：{{ d.hex.changed }}</div>
            <div><b>upper/lower</b>：{{ d.hex.upper }} / {{ d.hex.lower }}</div>
            <div><b>nuclear</b>：{{ d.hex.nuclear?.upper }} / {{ d.hex.nuclear?.lower }}</div>
            <div class="col-span-2"><b>lines</b>：<code>{{ d.hex.lines }}</code></div>
            <div class="col-span-2"><b>summary</b>：{{ d.hex.summary }}</div>
            <div class="col-span-2"><b>advice_general</b>：{{ d.hex.advice_general }}</div>
          </div>
        </div>

        <!-- 錯誤膠囊 -->
        <div v-if="d.kw_error || d.rank_error" class="errs" style="margin-top:8px;">
          <span v-if="d.kw_error" class="pill err">KW Error: {{ d.kw_error }}</span>
          <span v-if="d.rank_error" class="pill err">Rerank Error: {{ d.rank_error }}</span>
        </div>

        <!-- 原始輸出（協助排查 EmptyOutput） -->
        <div v-if="d.kw_raw_text" style="margin-top:8px;">
          <b>kw_raw_text</b>
          <pre class="mini-pre">{{ d.kw_raw_text }}</pre>
        </div>
        <div v-if="d.rank_raw_text" style="margin-top:8px;">
          <b>rank_raw_text</b>
          <pre class="mini-pre">{{ d.rank_raw_text }}</pre>
        </div>

        <!-- 使用量/狀態（可選） -->
        <div v-if="d.rank_usage || d.rank_status" class="grid" style="margin-top:8px;">
          <div><b>rank_status</b>：{{ d.rank_status ?? '-' }}</div>
          <div>
            <b>tokens</b>：
            in {{ d.rank_usage?.input_tokens ?? '-' }} /
            out {{ d.rank_usage?.output_tokens ?? '-' }}
          </div>
        </div>

        <!-- 候選清單預覽 -->
        <div v-if="d.candidates_preview?.length" class="tablewrap" style="margin-top:8px;">
          <table class="mini">
            <thead><tr><th>#</th><th>題名</th><th>score</th></tr></thead>
            <tbody>
              <tr v-for="c in d.candidates_preview" :key="c.id">
                <td>{{ c.number }}</td>
                <td>{{ c.title }}</td>
                <td>{{ c.score }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- FULLTEXT SQL -->
        <details v-if="d.sql" class="sql" style="margin-top:8px;">
          <summary>檢視 SQL</summary>
          <pre class="mini-pre">{{ d.sql }}</pre>
        </details>
      </details>

    </div>

    <div v-else class="empty">
      <p>目前沒有結果，請先回到抽籤頁求籤。</p>
      <button class="btn ghost" @click="back">回抽籤</button>
    </div>

    <div class="actions">
      <button class="btn" @click="toSurvey">前往問卷回饋</button>
      <button class="btn ghost" @click="back">再抽一次</button>
    </div>
  </section>
</template>

<style scoped>
.wrap { max-width: 800px; margin: 0 auto; padding: 16px; }
.card { background:#fff; border:1px solid #eee; border-radius:14px; padding:16px; }
.head { display:flex; align-items:center; gap:10px; }
.badge { background:#f59e0b; color:#fff; padding:2px 8px; border-radius:999px; font-size:12px; }
.poem { white-space:pre-wrap; background:#fafafa; padding:12px; border-radius:8px; }
.actions { margin-top:16px; display:flex; gap:10px; }
.btn { padding:8px 16px; border:none; border-radius:10px; background:#b45309; color:#fff; cursor:pointer; }
.btn.ghost { background:transparent; border:1px solid #b45309; color:#b45309; }
.empty { text-align:center; }

/* Debug styles */
.debug { margin-top:16px; border-top:1px dashed #ddd; padding-top:12px; }
.debug summary { cursor:pointer; user-select:none; display:flex; align-items:center; gap:8px; }
.pill { display:inline-block; padding:2px 8px; border-radius:999px; font-size:12px; border:1px solid #ddd; }
.pill.ok { background:#e6ffed; border-color:#86efac; color:#166534; }
.pill.warn { background:#fff7ed; border-color:#fdba74; color:#9a3412; }
.pill.err { background:#fee2e2; border-color:#fca5a5; color:#991b1b; }
.grid { display:grid; grid-template-columns: 1fr 1fr; gap:8px; margin-top:8px; }
.grid .col-span-2 { grid-column: 1 / span 2; }
.tablewrap { margin-top:8px; overflow:auto; }
.mini { width:100%; border-collapse: collapse; font-size:12px; }
.mini th, .mini td { border:1px solid #eee; padding:4px 6px; text-align:left; }
.sql { margin-top:8px; }
.sql pre { white-space:pre-wrap; background:#fafafa; padding:8px; border-radius:8px; }
.interpretation {
  white-space: pre-wrap;    /* 保留換行與自動換行 */
  line-height: 1.7;
}
</style>
