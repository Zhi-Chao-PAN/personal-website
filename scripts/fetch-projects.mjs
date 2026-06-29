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
 * No GitHub token needed for public repos (60 req/h unauthenticated — we use ~21).
 * On rate-limit / 404 / network error, falls back to META values so the build
 * never breaks.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const GITHUB_API = 'https://api.github.com';
const TIMEOUT_MS = 8000;

// Mirror of lib/projects.ts META (kept inline so this script can be run without
// TypeScript tooling). Keep in sync when adding new projects.
const META = [
  { slug: 'launchlens-ai', displayName: 'LaunchLens AI', demoUrl: 'https://launchlens-ai-two.vercel.app', taglineOverride: 'AI-powered go-to-market workspace — research, positioning & GTM briefs.', fallbackStars: 1, fallbackTopics: ['nextjs', 'ai', 'typescript', 'tailwindcss'], fallbackLanguage: 'TypeScript', headline: { label: 'release', value: 'v1.0.0' }, references: ['launchlens-research-studio'], pitchZh: '创业者最贵的成本是「想清楚再动手」。LaunchLens 把市场调研、用户画像、产品定位、首版文案一次性跑完，把过去两周的 GTM 工作压到一杯咖啡的时间。' },
  { slug: 'launchlens-research-studio', displayName: 'LaunchLens Research Studio', demoUrl: 'https://launchlens-research-studio.vercel.app', taglineOverride: 'Multi-agent market intelligence — 6 AI agents research any product in parallel.', fallbackStars: 0, fallbackTopics: ['multi-agent', 'nextjs', 'typescript'], fallbackLanguage: 'TypeScript', headline: { label: 'tests passing', value: '1,423' }, references: ['launchlens-ai'], pitchZh: '一个想法值不值得做，过去要请咨询公司写报告。Research Studio 派出 6 个 AI 角色并行调研，几分钟给出竞品、用户、风险三维结论。' },
  { slug: 'model-eval-studio', displayName: 'Model Eval Studio', demoUrl: 'https://model-test-assistant.vercel.app', taglineOverride: 'Multi-model evaluation workspace — AI identifies models from screenshots & generates comparison reports.', fallbackStars: 0, fallbackTopics: ['ai', 'evaluation', 'typescript'], fallbackLanguage: 'TypeScript', headline: null, references: [], pitchZh: '选 AI 模型像开盲盒——参数看不懂、跑分不可信。Model Eval Studio 截图即识别模型、自动跑多维度对比，给你一份能拍板的选型报告。' },
  { slug: 'codex-zcode-remote-relay', displayName: 'Codex ↔ ZCode Remote Relay', demoUrl: null, taglineOverride: 'Local Codex-to-ZCode multi-agent relay — bounded delegation, worker pools, safety gates.', fallbackStars: 0, fallbackTopics: ['multi-agent', 'nodejs', 'zcode', 'codex'], fallbackLanguage: 'JavaScript', headline: { label: 'lines of code', value: '< 1k' }, references: [], pitchZh: '多 AI 协作听起来很美，做起来全是协调成本。这套本地中继让 Codex 和 ZCode 像同事一样分工，结果可控、过程可审计。' },
  { slug: 'LangGraph-Financial-Swarm', displayName: 'LangGraph Financial Swarm', demoUrl: null, taglineOverride: 'Multi-agent financial research system — LangGraph orchestration, local LLMs, tool use.', fallbackStars: 0, fallbackTopics: ['langgraph', 'multi-agent', 'python', 'finance'], fallbackLanguage: 'Python', headline: { label: 'specialists', value: '5 agents' }, references: [], pitchZh: '投研报告动辄几十页，谁来读、谁来核？五个 AI 专家分头扒数据、交叉验证、最后合成可追溯的结论，把人从重复劳动里解放出来。' },
  { slug: 'safety-critical-battery-prognostics', displayName: 'Safety-Critical Battery Prognostics', demoUrl: null, taglineOverride: 'Reproducible battery RUL — three-layer physics defense, uncertainty-aware evaluation.', fallbackStars: 4, fallbackTopics: ['battery', 'pinn', 'conformal-prediction', 'pytorch'], fallbackLanguage: 'Python', headline: { label: '3-layer defense', value: 'VR 0.00%' }, references: [], pitchZh: '电池剩余寿命预测的误差，是召回事故和保险理赔的分水岭。这套系统用三层物理约束把「幻觉预测」挡在门外，置信度低就主动报警。' },
  { slug: 'structure-aware-rag-empirical', displayName: 'Structure-Aware RAG (Empirical)', demoUrl: null, taglineOverride: 'Empirical study — Structure-Aware Parsing lifts Financial RAG accuracy by 37.5%.', fallbackStars: 0, fallbackTopics: ['rag', 'llamaindex', 'nlp', 'benchmark'], fallbackLanguage: 'Python', headline: { label: 'accuracy lift', value: '+37.5%' }, references: [], pitchZh: 'RAG 检索准不准，答案藏在文档结构里。这份实证研究证明：把表格、标题、章节结构喂给 RAG，金融问答准确率直接提升 37.5%。' },
];

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
    const { readFile } = await import('node:fs/promises');
    const path = join(ROOT, 'data', 'stacks.generated.json');
    const text = await readFile(path, 'utf8');
    return JSON.parse(text);
  } catch {
    return { stacks: {} };
  }
}

async function fetchJson(url, label) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'panzhichao-portfolio-fetch',
        'Accept': 'application/vnd.github+json',
      },
      signal: ctrl.signal,
    });
    if (!res.ok) {
      console.warn(`[fetch-projects] ${label}: HTTP ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[fetch-projects] ${label}: ${err.message}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
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
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${slug}/commits?per_page=1`, {
      headers: {
        'User-Agent': 'panzhichao-portfolio-fetch',
        'Accept': 'application/vnd.github+json',
      },
      signal: ctrl.signal,
    });
    if (!res.ok) {
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
    console.warn(`[fetch-projects] commits/${slug}: ${err.message}`);
    return 0;
  } finally {
    clearTimeout(timer);
  }
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
  console.log('[fetch-projects] Fetching 7 repos + languages + commits from GitHub...');
  const started = Date.now();

  const results = await Promise.all(META.map(async (meta) => {
    const [api, languages, commits] = await Promise.all([
      fetchRepo(meta.slug),
      fetchLanguages(meta.slug),
      fetchCommitCount(meta.slug),
    ]);

    const language = normalizeLanguage(api?.language);
    const pushedAt = api?.pushed_at ?? new Date().toISOString();
    const createdAt = api?.created_at ?? new Date().toISOString();
    const stack = STACK_DATA.stacks?.[meta.slug] ?? [];

    return {
      slug: meta.slug,
      name: meta.displayName,
      description: api?.description ?? '',
      tagline: meta.taglineOverride ?? buildTagline(api?.description),
      language,
      languageColor: GITHUB_LANGUAGE_PALETTE[language] ?? '#8b8b8b',
      languages: buildLanguageBreakdown(languages, meta.fallbackLanguage),
      stars: api?.stargazers_count ?? meta.fallbackStars,
      commits,
      topics: (api?.topics ?? meta.fallbackTopics).slice(0, 4).map((t) => String(t).toLowerCase()),
      createdAt,
      pushedAt,
      ageInDays: ageInDays(createdAt),
      pushedRelative: relativeTime(pushedAt),
      size: api?.size ?? 0,
      sizeHuman: humanSize((api?.size ?? 0) * 1024), // GitHub reports size in KB
      license: api?.license?.spdx_id ?? null,
      defaultBranch: api?.default_branch ?? 'main',
      stack,
      headline: meta.headline ?? null,
      references: meta.references ?? [],
      // Optional Chinese elevator pitch — hand-curated, written for non-technical
      // visitors (investors, recruiters, friends). Stored alongside META so it
      // round-trips through fetch → generated JSON → fallback JSON.
      ...(meta.pitchZh ? { pitchZh: meta.pitchZh } : {}),
      imageType: meta.imageType ?? 'og-poster',
      imageLabel: meta.imageLabel ?? 'OG POSTER',
      githubUrl: api?.html_url ?? `https://github.com/${GITHUB_OWNER}/${meta.slug}`,
      demoUrl: meta.demoUrl,
      featured: meta.demoUrl !== null,
    };
  }));

  // Detect a catastrophic fetch failure (most repos came back with 0 commits + 0 size + empty description)
  // — typically caused by rate-limiting (HTTP 403). Fall back to a hand-curated snapshot.
  const failedCount = results.filter((r) => r.commits === 0 && r.size === 0 && r.description === '').length;
  if (failedCount >= 5) {
    console.warn(`[fetch-projects] ${failedCount}/7 GitHub API calls failed (likely rate-limited). Falling back to data/projects.fallback.json`);
    const { readFile } = await import('node:fs/promises');
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
