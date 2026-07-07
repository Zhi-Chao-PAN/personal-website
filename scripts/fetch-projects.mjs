#!/usr/bin/env node
/**
 * fetch-projects.mjs
 *
 * Build-time script: reads META (mirrored inline), hits the GitHub REST API
 * for each repo + languages + commits, and writes data/projects.generated.json
 * that's imported by app/page.tsx.
 *
 * Runs at:
 *   - `prebuild` (Vercel CI)
 *   - local `npm run build`
 *
 * No GitHub token required for public repos, but GH_TOKEN/GITHUB_TOKEN is used
 * when available to avoid local and CI rate limits.
 * On rate-limit / 404 / network error, falls back to the previous generated
 * snapshot before META values so the build never breaks or erases good data.
 */

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const GITHUB_API = 'https://api.github.com';
const TIMEOUT_MS = 20_000;
const RETRY_DELAYS_MS = [500, 1500];
const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;

// Mirror of lib/projects.ts META (kept inline so this script can be run without
// TypeScript tooling). Keep in sync when adding new projects.
const META = [
  { slug: 'launchlens-ai', displayName: 'LaunchLens AI', demoUrl: 'https://launchlens-ai-two.vercel.app', taglineOverride: 'AI-powered go-to-market workspace — research, positioning & GTM briefs.', fallbackStars: 1, fallbackTopics: ['nextjs', 'ai', 'typescript', 'tailwindcss'], fallbackLanguage: 'TypeScript', headline: { label: 'release', value: 'v1.0.0' }, references: ['launchlens-research-studio'], pitchZh: '创业者最贵的成本是「想清楚再动手」——一份 GTM 报告要请咨询公司写 2–3 周、几十万元。LaunchLens 把市场调研、用户画像、竞品拆解、产品定位、首版营销文案一次性跑完，过去 2 周的工作压到一杯咖啡的时间。系统内置 30+ 行业模板和 6 套定位框架，AI 会主动追问并修正假设，最后输出一份能直接拿给投资人或团队开会的 BP 草稿。适合早期创业者、企划负责人、独立咨询顾问，5 分钟跑出过去需要 1 个分析师 1 周的产出。' },
  { slug: 'launchlens-research-studio', displayName: 'LaunchLens Research Studio', demoUrl: 'https://launchlens-research-studio.vercel.app', taglineOverride: 'Multi-agent market intelligence — 6 AI agents research any product in parallel.', fallbackStars: 0, fallbackTopics: ['multi-agent', 'nextjs', 'typescript'], fallbackLanguage: 'TypeScript', headline: { label: 'tests passing', value: '1,423' }, references: ['launchlens-ai'], pitchZh: '一个想法值不值得做，过去要请咨询公司花几周时间、十几万元来验证。Research Studio 派出 6 个 AI 角色并行调研——市场分析师扒规模、竞品专家拆解对手、用户研究员还原真实使用场景、风控顾问挑刺、PM 估算落地难度——5 分钟内把竞品、用户、风险三个维度同时拉齐到一份决策级简报里。整套调研链路可审计、可重跑、可对比不同假设下的结论差异。适合产品经理、战略分析师、早期投资人快速判断「这个方向能不能投、要不要做」。' },
  { slug: 'model-eval-studio', displayName: 'Model Eval Studio', demoUrl: 'https://model-test-assistant.vercel.app', taglineOverride: 'Multi-model evaluation workspace — AI identifies models from screenshots & generates comparison reports.', fallbackStars: 0, fallbackTopics: ['ai', 'evaluation', 'typescript'], fallbackLanguage: 'TypeScript', headline: null, references: [], pitchZh: "选 AI 模型像开盲盒——参数表看不懂、第三方跑分不可信、自己测又没时间。Model Eval Studio 让你截图就识别模型、自动跑多维度对比，给出一份能拍板的选型报告。系统支持自定义评测集（多模态、推理、代码、长上下文都能配），自动产出 leaderboard + 成本曲线 + 失败案例分析。适合 AI 应用团队的架构师、CTO、模型采购决策者，把过去 2 周的选型会压成一个下午的可视化对比。" },
  { slug: 'codex-zcode-remote-relay', displayName: 'Codex ↔ ZCode Remote Relay', demoUrl: null, taglineOverride: 'Local Codex-to-ZCode multi-agent relay — bounded delegation, worker pools, safety gates.', fallbackStars: 0, fallbackTopics: ['multi-agent', 'nodejs', 'zcode', 'codex'], fallbackLanguage: 'JavaScript', headline: { label: 'lines of code', value: '< 1k' }, references: [], pitchZh: '让多个 AI 协作听起来很美，做起来全是协调成本——谁负责什么、中间怎么交接、错了谁背锅、上下文怎么隔离，全是要自己造的轮子。这套本地中继让 Codex 和 ZCode 像一支有分工的团队：主代理分任务、子代理并行执行、每个任务有边界（不允许碰什么、最多跑多久、失败了怎么收尾），整个过程可审计、可中断、可恢复。整套系统不到 1000 行代码，单机就能跑，没有云依赖。适合需要把 AI 协作从「玩具演示」推进到「生产级流水线」的工程团队。' },
  { slug: 'LangGraph-Financial-Swarm', displayName: 'LangGraph Financial Swarm', demoUrl: null, taglineOverride: 'Multi-agent financial research system — LangGraph orchestration, local LLMs, tool use.', fallbackStars: 0, fallbackTopics: ['langgraph', 'multi-agent', 'python', 'finance'], fallbackLanguage: 'Python', headline: { label: 'specialists', value: '5 agents' }, references: [], pitchZh: '投研报告动辄几十页、引用链路散落十几个文件，谁来读、谁来核、结论怎么追溯？五个 AI 专家分头扒数据、交叉验证、最后合成可追溯的结论：宏观分析师讲周期、行业研究员拆赛道、公司专家读财报、风险官挑漏洞、PM 把结论落到投资决策。每一段结论都标注原始出处和推理路径，监管和合规可以直接审计。整套系统用 LangGraph 编排 + 本地 LLM，企业内网就能跑，数据不出域。适合券商研究所、买方投研、家族办公室，把分析师从 60% 的重复劳动里解放出来，专注真正的判断。' },
  { slug: 'safety-critical-battery-prognostics', displayName: 'Safety-Critical Battery Prognostics', demoUrl: null, taglineOverride: 'Reproducible battery RUL — three-layer physics defense, uncertainty-aware evaluation.', fallbackStars: 4, fallbackTopics: ['battery', 'pinn', 'conformal-prediction', 'pytorch'], fallbackLanguage: 'Python', headline: { label: '3-layer defense', value: 'VR 0.00%' }, references: [], pitchZh: '电池剩余寿命（RUL）预测的误差，是电动车召回事故和储能保险理赔的分水岭——预测过乐观，车在路上趴窝；预测过保守，整批电池提前报废。这套系统用三层物理约束把「AI 幻觉预测」挡在门外：底层是物理信息神经网络（PINN），把电化学方程写进损失函数；中层是不确定性量化（conformal prediction），模型不光给数字、还主动说「我有多大把握」；顶层是漂移检测，传感器一有异常就告警。整套 pipeline 在公开数据集（NASA PCoE、Stanford、MIT-Stanford 快充老化）上验证，VR 错误率 0.00%。适合动力电池厂商、储能集成商、保险定损机构，把「靠经验拍脑袋」的预测变成可追溯、可认证的工程指标。' },
  { slug: 'structure-aware-rag-empirical', displayName: 'Structure-Aware RAG (Empirical)', demoUrl: null, taglineOverride: 'Empirical study — Structure-Aware Parsing lifts Financial RAG accuracy by 37.5%.', fallbackStars: 0, fallbackTopics: ['rag', 'llamaindex', 'nlp', 'benchmark'], fallbackLanguage: 'Python', headline: { label: 'accuracy lift', value: '+37.5%' }, references: [], pitchZh: 'RAG 检索准不准，答案藏在文档结构里——金融研报里一张利润表胜过三段话、一份招股书的目录结构比 10 页正文更值钱。这份实证研究对比了 5 种文档解析策略（纯文本 / OCR / 通用 layout / 结构感知 / 人工标注 ground truth），在 4 个金融问答 benchmark 上跑出完整数据：结构感知解析让 RAG 准确率从 52% 提升到 71.5%，相对提升 37.5%，且错误率降低 60%。整套实验脚本、数据集、评测代码全部开源可复现。适合做 RAG 的工程团队、企业知识库负责人、AI 投资尽调——少走 3 个月弯路。' },
  { slug: 'ai-life-progress-coach', displayName: 'AI Life Progress Coach', demoUrl: null, publicRepoUrl: null, taglineOverride: 'Local-first AI life operating system — goals, tasks, reviews, and privacy-safe progress evidence.', fallbackStars: 0, fallbackTopics: ['ai-coach', 'life-os', 'nextjs', 'local-first'], fallbackLanguage: 'TypeScript', headline: { label: 'tests', value: '830+' }, references: ['launchlens-ai', 'model-eval-studio'], pitchZh: '它不是又一个待办清单，而是把长期目标拆成每天可执行、可复盘、可解释的成长系统。任务、日记、恢复状态、周/月回顾和 AI 建议落在同一条证据链里，用户能看到自己为什么在前进、哪里卡住、下一步该做什么。', imageType: 'og-poster', imageLabel: 'CASE POSTER' },
  { slug: 'CampusTradeAI', displayName: 'CampusTradeAI', demoUrl: null, publicRepoUrl: null, taglineOverride: 'Campus marketplace mini-program — trading, trust, moderation, payment gates, and ops workflows.', fallbackStars: 0, fallbackTopics: ['wechat-miniprogram', 'marketplace', 'cloud-functions', 'campus'], fallbackLanguage: 'JavaScript', headline: { label: 'files', value: '1.4k' }, references: ['ai-life-progress-coach'], pitchZh: '校园二手交易不是一个商品列表就够了，真正难的是信任、审核、增长、支付边界和运营闭环。CampusTradeAI 把闲置交易、求购、校园服务、聊天、举报审核、校园币、店铺和运营体检组织成一套小程序系统，展示复杂业务流和移动端产品落地能力。', imageType: 'og-poster', imageLabel: 'CASE POSTER' },
  { slug: 'vision-centric-financial-swarm', displayName: 'Vision-Centric Financial Swarm', demoUrl: null, publicRepoUrl: null, taglineOverride: 'Multi-modal financial RAG — ColPali retrieval, ROI cropping, and agentic verification.', fallbackStars: 0, fallbackTopics: ['multimodal-rag', 'colpali', 'finance', 'langgraph'], fallbackLanguage: 'Python', headline: { label: 'token cost', value: '-80%' }, references: ['LangGraph-Financial-Swarm', 'structure-aware-rag-empirical'], pitchZh: '传统 RAG 把 PDF 当文本拆，最容易丢掉图表、表格和页面布局。这个项目直接把财报页面当视觉对象处理：用 ColPali 做多向量检索，再通过 ROI 裁剪把关键区域送给视觉模型，最后由 agent 做跨页推理和数值校验。', imageType: 'og-poster', imageLabel: 'CASE POSTER' },
  { slug: 'deepnerve-3d', displayName: 'DeepNerve-3D', demoUrl: null, publicRepoUrl: null, taglineOverride: 'Research-style 3D medical segmentation — SwinUNETR, topology constraints, and CBCT nerve tracing.', fallbackStars: 0, fallbackTopics: ['medical-imaging', 'segmentation', 'pytorch', 'monai'], fallbackLanguage: 'Python', headline: { label: 'foreground', value: '<0.1%' }, references: ['safety-critical-battery-prognostics'], pitchZh: '这个项目的价值不在炫界面，而在把困难的医学影像问题讲清楚：3D CBCT 中下牙槽神经前景极少、对比度低、拓扑连续性要求高。DeepNerve-3D 用 SwinUNETR、滑窗推理和连通域约束，把研究思路落到可运行的分割 pipeline 里。', imageType: 'og-poster', imageLabel: 'CASE POSTER' },
];

const DISPLAY_ORDER = [
  'launchlens-ai',
  'launchlens-research-studio',
  'model-eval-studio',
  'ai-life-progress-coach',
  'vision-centric-financial-swarm',
  'deepnerve-3d',
  'CampusTradeAI',
  'codex-zcode-remote-relay',
  'LangGraph-Financial-Swarm',
  'safety-critical-battery-prognostics',
  'structure-aware-rag-empirical',
];
const DISPLAY_ORDER_INDEX = new Map(DISPLAY_ORDER.map((slug, index) => [slug, index]));

const GITHUB_OWNER = 'Zhi-Chao-PAN';
const GITHUB_LANGUAGE_PALETTE = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Jupyter: '#DA5B0B',
  Shell: '#89e051',
  Dockerfile: '#384d54',
  CSS: '#563d7c',
  HTML: '#e34c26',
  SCSS: '#c6538c',
  Rust: '#dea584',
  Go: '#00ADD8',
  Other: '#8b8b8b',
};

const STACK_DATA = await loadStackData();
const PREVIOUS_PROJECT_DATA = await loadPreviousProjectData();
const PREVIOUS_BY_SLUG = new Map(
  (PREVIOUS_PROJECT_DATA.projects ?? []).map((project) => [project.slug, project]),
);

function githubHeaders() {
  return {
    'User-Agent': 'panzhichao-portfolio-fetch',
    'Accept': 'application/vnd.github+json',
    ...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
  };
}

function sleep(ms) {
  return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}

function buildTagline(description, maxLen = 110) {
  if (!description) return '';
  const first = description.split(/(?<=[.!?])\s+/)[0] ?? description;
  if (first.length <= maxLen) return first;
  const trimmed = first.slice(0, maxLen);
  const lastSpace = trimmed.lastIndexOf(' ');
  return (lastSpace > 40 ? trimmed.slice(0, lastSpace) : trimmed).trimEnd() + '…';
}

function relativeTime(iso, now = new Date()) {
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  if (Number.isNaN(then) || diffMs < 0) return 'just now';
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  const yr = Math.floor(mo / 12);
  return `${yr}y ago`;
}

function humanSize(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(gb < 10 ? 1 : 0)} GB`;
}

function ageInDays(iso, now = new Date()) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 0;
  return Math.max(0, Math.floor((now.getTime() - then) / (1000 * 60 * 60 * 24)));
}

async function loadStackData() {
  try {
    const path = join(ROOT, 'data', 'stacks.generated.json');
    const text = await readFile(path, 'utf8');
    return JSON.parse(text);
  } catch {
    return { stacks: {} };
  }
}

async function loadPreviousProjectData() {
  try {
    const path = join(ROOT, 'data', 'projects.generated.json');
    const text = await readFile(path, 'utf8');
    return JSON.parse(text);
  } catch {
    return { projects: [] };
  }
}

async function fetchJson(url, label) {
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: githubHeaders(),
        signal: ctrl.signal,
      });
      if (res.status === 404) return null;
      if (!res.ok) {
        if (attempt < RETRY_DELAYS_MS.length && res.status >= 500) {
          await sleep(RETRY_DELAYS_MS[attempt]);
          continue;
        }
        console.warn(`[fetch-projects] ${label}: HTTP ${res.status}`);
        return null;
      }
      return await res.json();
    } catch (err) {
      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }
      console.warn(`[fetch-projects] ${label}: ${err.message}`);
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

function normalizeLanguage(lang) {
  if (lang === 'TypeScript' || lang === 'Python' || lang === 'JavaScript') return lang;
  return lang ?? 'Other';
}

async function fetchRepo(slug) {
  return fetchJson(`${GITHUB_API}/repos/${GITHUB_OWNER}/${slug}`, `repo/${slug}`);
}

async function fetchLanguages(slug) {
  return fetchJson(`${GITHUB_API}/repos/${GITHUB_OWNER}/${slug}/languages`, `languages/${slug}`);
}

async function fetchCommitCount(slug) {
  // Use Link header from per_page=1 to get total count without fetching all commits.
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${slug}/commits?per_page=1`, {
        headers: githubHeaders(),
        signal: ctrl.signal,
      });
      if (!res.ok) {
        if (attempt < RETRY_DELAYS_MS.length && res.status >= 500) {
          await sleep(RETRY_DELAYS_MS[attempt]);
          continue;
        }
        console.warn(`[fetch-projects] commits/${slug}: HTTP ${res.status}`);
        return 0;
      }
      const link = res.headers.get('Link') ?? '';
      // Link header format: <https://api.github.com/.../commits?page=42&per_page=1>; rel="last"
      const match = link.match(/[?&]page=(\d+)[^>]*rel="last"/);
      if (match) return Number(match[1]);
      // If no Link header, the response only had 1 page; count = data length
      const data = await res.json();
      return Array.isArray(data) ? data.length : 0;
    } catch (err) {
      if (attempt < RETRY_DELAYS_MS.length) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }
      console.warn(`[fetch-projects] commits/${slug}: ${err.message}`);
      return 0;
    } finally {
      clearTimeout(timer);
    }
  }
  return 0;
}

function buildLanguageBreakdown(api, fallback) {
  if (!api || Object.keys(api).length === 0) {
    return [{
      name: fallback,
      bytes: 1,
      color: GITHUB_LANGUAGE_PALETTE[fallback] ?? '#8b8b8b',
      percent: 100,
    }];
  }
  const total = Object.values(api).reduce((s, n) => s + Number(n), 0) || 1;
  return Object.entries(api)
    .map(([name, bytes]) => ({
      name,
      bytes: Number(bytes),
      color: GITHUB_LANGUAGE_PALETTE[name] ?? '#8b8b8b',
      percent: Math.round((Number(bytes) / total) * 100),
    }))
    .sort((a, b) => b.bytes - a.bytes);
}

async function main() {
  console.log(`[fetch-projects] Fetching ${META.length} repos + languages + commits from GitHub...`);
  const started = Date.now();

  const results = (await Promise.all(META.map(async (meta) => {
    const [api, languages, commits] = await Promise.all([
      fetchRepo(meta.slug),
      fetchLanguages(meta.slug),
      fetchCommitCount(meta.slug),
    ]);

    const previous = PREVIOUS_BY_SLUG.get(meta.slug);
    const description = api?.description ?? previous?.description ?? '';
    const language = normalizeLanguage(api?.language ?? previous?.language ?? meta.fallbackLanguage);
    const pushedAt = api?.pushed_at ?? previous?.pushedAt ?? new Date().toISOString();
    const createdAt = api?.created_at ?? previous?.createdAt ?? new Date().toISOString();
    const rawStack = STACK_DATA.stacks?.[meta.slug];
    const stack = Array.isArray(rawStack) && rawStack.length > 0 ? rawStack : previous?.stack ?? [];
    const hasLanguagePayload = languages && Object.keys(languages).length > 0;
    const languageBreakdown = hasLanguagePayload
      ? buildLanguageBreakdown(languages, meta.fallbackLanguage)
      : previous?.languages ?? buildLanguageBreakdown(languages, meta.fallbackLanguage);
    const size = api?.size ?? previous?.size ?? 0;

    return {
      slug: meta.slug,
      name: meta.displayName,
      description,
      tagline: meta.taglineOverride ?? (description ? buildTagline(description) : previous?.tagline ?? ''),
      language,
      languageColor: GITHUB_LANGUAGE_PALETTE[language] ?? '#8b8b8b',
      languages: languageBreakdown,
      stars: api?.stargazers_count ?? previous?.stars ?? meta.fallbackStars,
      commits: commits > 0 ? commits : previous?.commits ?? 0,
      topics: (api?.topics ?? previous?.topics ?? meta.fallbackTopics).slice(0, 4).map((t) => String(t).toLowerCase()),
      createdAt,
      pushedAt,
      ageInDays: ageInDays(createdAt),
      pushedRelative: relativeTime(pushedAt),
      size,
      sizeHuman: api?.size !== undefined ? humanSize(size * 1024) : previous?.sizeHuman ?? humanSize(size * 1024), // GitHub reports size in KB
      license: api?.license?.spdx_id ?? previous?.license ?? null,
      defaultBranch: api?.default_branch ?? previous?.defaultBranch ?? 'main',
      stack,
      headline: meta.headline ?? null,
      references: meta.references ?? [],
      // Optional Chinese elevator pitch — hand-curated, written for non-technical
      // visitors (investors, recruiters, friends). Stored alongside META so it
      // round-trips through fetch → generated JSON → fallback JSON.
      ...(meta.pitchZh ? { pitchZh: meta.pitchZh } : {}),
      imageType: meta.imageType ?? 'og-poster',
      imageLabel: meta.imageLabel ?? 'OG POSTER',
      githubUrl: meta.publicRepoUrl === null
        ? null
        : api?.html_url ?? previous?.githubUrl ?? meta.publicRepoUrl ?? `https://github.com/${GITHUB_OWNER}/${meta.slug}`,
      demoUrl: meta.demoUrl,
      featured: meta.demoUrl !== null,
    };
  }))).sort(
    (a, b) =>
      (DISPLAY_ORDER_INDEX.get(a.slug) ?? Number.MAX_SAFE_INTEGER) -
      (DISPLAY_ORDER_INDEX.get(b.slug) ?? Number.MAX_SAFE_INTEGER),
  );

  // Detect a catastrophic fetch failure (most repos came back with 0 commits + 0 size + empty description)
  // — typically caused by rate-limiting (HTTP 403). Fall back to a hand-curated snapshot.
  const failedCount = results.filter((r) => r.commits === 0 && r.size === 0 && r.description === '').length;
  const catastrophicFailureThreshold = Math.max(5, Math.ceil(META.length * 0.7));
  if (failedCount >= catastrophicFailureThreshold) {
    console.warn(`[fetch-projects] ${failedCount}/${META.length} GitHub API calls failed (likely rate-limited). Falling back to data/projects.fallback.json`);
    const fallbackPath = join(ROOT, 'data', 'projects.fallback.json');
    const fallback = JSON.parse(await readFile(fallbackPath, 'utf8'));
    fallback.generatedAt = new Date().toISOString();
    fallback.source = 'fallback';
    const outPath = join(ROOT, 'data', 'projects.generated.json');
    await writeFile(outPath, JSON.stringify(fallback, null, 2) + '\n', 'utf8');
    console.log(`[fetch-projects] Wrote fallback data → ${outPath}`);
    return;
  }

  const totalStars = results.reduce((s, r) => s + r.stars, 0);
  const liveDemos = results.filter((r) => r.featured).length;
  const totalSizeMb = results.reduce((s, r) => s + r.size, 0) / 1024;

  const output = {
    generatedAt: new Date().toISOString(),
    source: 'github-api',
    stats: {
      totalRepos: results.length,
      totalStars,
      liveDemos,
      totalSizeMb: Math.round(totalSizeMb * 10) / 10,
    },
    projects: results,
  };

  const outPath = join(ROOT, 'data', 'projects.generated.json');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(output, null, 2) + '\n', 'utf8');

  const elapsed = Date.now() - started;
  console.log(`[fetch-projects] Wrote ${results.length} projects → ${outPath} (${elapsed}ms)`);
  console.log(`[fetch-projects] Stats: ${results.length} repos, ${totalStars} stars, ${liveDemos} live demos, ${output.stats.totalSizeMb} MB total`);
}

main().catch((err) => {
  console.error('[fetch-projects] Fatal:', err);
  process.exit(0);
});
