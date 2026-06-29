#!/usr/bin/env node
/**
 * fetch-projects.mjs
 *
 * Build-time script: reads lib/projects.ts (META), hits the GitHub REST API
 * for each repo, and writes a merged + sorted data/projects.generated.json
 * that's imported by app/page.tsx.
 *
 * Runs at:
 *   - `prebuild` (Vercel CI)
 *   - local `npm run build`
 *
 * No GitHub token needed for public repos (60 req/h unauthenticated — we use 7).
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

/**
 * Minimal project types — must match lib/projects.types.ts.
 * Defined inline so this script can be run without TypeScript tooling.
 */
const META = [
  { slug: 'launchlens-ai', displayName: 'LaunchLens AI', demoUrl: 'https://launchlens-ai-two.vercel.app', taglineOverride: 'AI-powered go-to-market workspace — research, positioning & GTM briefs.', fallbackStars: 1, fallbackTopics: ['nextjs', 'ai', 'typescript', 'tailwindcss'], fallbackLanguage: 'TypeScript' },
  { slug: 'launchlens-research-studio', displayName: 'LaunchLens Research Studio', demoUrl: 'https://launchlens-research-studio.vercel.app', taglineOverride: 'Multi-agent market intelligence — 6 AI agents research any product in parallel.', fallbackStars: 0, fallbackTopics: ['multi-agent', 'nextjs', 'typescript'], fallbackLanguage: 'TypeScript' },
  { slug: 'model-eval-studio', displayName: 'Model Eval Studio', demoUrl: 'https://model-test-assistant.vercel.app', taglineOverride: 'Multi-model evaluation workspace — AI identifies models from screenshots & generates comparison reports.', fallbackStars: 0, fallbackTopics: ['ai', 'evaluation', 'typescript'], fallbackLanguage: 'TypeScript' },
  { slug: 'codex-zcode-remote-relay', displayName: 'Codex ↔ ZCode Remote Relay', demoUrl: null, taglineOverride: 'Local Codex-to-ZCode multi-agent relay — bounded delegation, worker pools, safety gates.', fallbackStars: 0, fallbackTopics: ['multi-agent', 'nodejs', 'zcode', 'codex'], fallbackLanguage: 'JavaScript' },
  { slug: 'LangGraph-Financial-Swarm', displayName: 'LangGraph Financial Swarm', demoUrl: null, taglineOverride: 'Multi-agent financial research system — LangGraph orchestration, local LLMs, tool use.', fallbackStars: 0, fallbackTopics: ['langgraph', 'multi-agent', 'python', 'finance'], fallbackLanguage: 'Python' },
  { slug: 'safety-critical-battery-prognostics', displayName: 'Safety-Critical Battery Prognostics', demoUrl: null, taglineOverride: 'Reproducible battery RUL — three-layer physics defense, uncertainty-aware evaluation.', fallbackStars: 4, fallbackTopics: ['battery', 'pinn', 'conformal-prediction', 'pytorch'], fallbackLanguage: 'Python' },
  { slug: 'structure-aware-rag-empirical', displayName: 'Structure-Aware RAG (Empirical)', demoUrl: null, taglineOverride: 'Empirical study — Structure-Aware Parsing lifts Financial RAG accuracy by 37.5%.', fallbackStars: 0, fallbackTopics: ['rag', 'llamaindex', 'nlp', 'benchmark'], fallbackLanguage: 'Python' },
];

const GITHUB_OWNER = 'Zhi-Chao-PAN';
const LANGUAGE_COLORS = { TypeScript: '#3178c6', Python: '#3572A5', JavaScript: '#f1e05a', Other: '#8b8b8b' };

function buildTagline(description, maxLen = 110) {
  if (!description) return '';
  const first = description.split(/(?<=[.!?])\s+/)[0] ?? description;
  if (first.length <= maxLen) return first;
  const trimmed = first.slice(0, maxLen);
  const lastSpace = trimmed.lastIndexOf(' ');
  return (lastSpace > 40 ? trimmed.slice(0, lastSpace) : trimmed).trimEnd() + '…';
}

async function fetchRepo(slug) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${slug}`, {
      headers: {
        'User-Agent': 'panzhichao-portfolio-fetch',
        'Accept': 'application/vnd.github+json',
      },
      signal: ctrl.signal,
    });
    if (!res.ok) {
      console.warn(`[fetch-projects] ${slug}: HTTP ${res.status}, falling back to META`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`[fetch-projects] ${slug}: ${err.message}, falling back to META`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function normalizeLanguage(lang) {
  if (lang === 'TypeScript' || lang === 'Python' || lang === 'JavaScript') return lang;
  return 'Other';
}

async function main() {
  console.log('[fetch-projects] Fetching 7 repos from GitHub...');
  const started = Date.now();

  const results = await Promise.all(META.map(async (meta) => {
    const api = await fetchRepo(meta.slug);

    if (api) {
      const language = normalizeLanguage(api.language);
      return {
        slug: meta.slug,
        name: meta.displayName,
        description: api.description ?? '',
        tagline: meta.taglineOverride ?? buildTagline(api.description),
        language,
        languageColor: LANGUAGE_COLORS[language],
        stars: api.stargazers_count ?? meta.fallbackStars,
        topics: (api.topics ?? meta.fallbackTopics).slice(0, 4).map((t) => String(t).toLowerCase()),
        githubUrl: api.html_url ?? `https://github.com/${GITHUB_OWNER}/${meta.slug}`,
        demoUrl: meta.demoUrl,
        featured: meta.demoUrl !== null,
        pushedAt: api.pushed_at ?? new Date().toISOString(),
      };
    }

    // Fallback path
    return {
      slug: meta.slug,
      name: meta.displayName,
      description: '',
      tagline: meta.taglineOverride ?? '',
      language: meta.fallbackLanguage,
      languageColor: LANGUAGE_COLORS[meta.fallbackLanguage],
      stars: meta.fallbackStars,
      topics: meta.fallbackTopics,
      githubUrl: `https://github.com/${GITHUB_OWNER}/${meta.slug}`,
      demoUrl: meta.demoUrl,
      featured: meta.demoUrl !== null,
      pushedAt: new Date().toISOString(),
    };
  }));

  // Aggregate stats for the subtitle
  const totalStars = results.reduce((s, r) => s + r.stars, 0);
  const liveDemos = results.filter((r) => r.featured).length;

  const output = {
    generatedAt: new Date().toISOString(),
    source: 'github-api',
    stats: {
      totalRepos: results.length,
      totalStars,
      liveDemos,
    },
    projects: results,
  };

  const outPath = join(ROOT, 'data', 'projects.generated.json');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(output, null, 2) + '\n', 'utf8');

  const elapsed = Date.now() - started;
  console.log(`[fetch-projects] Wrote ${results.length} projects → ${outPath} (${elapsed}ms)`);
  console.log(`[fetch-projects] Stats: ${results.length} repos, ${totalStars} stars, ${liveDemos} live demos`);
}

main().catch((err) => {
  console.error('[fetch-projects] Fatal:', err);
  // Don't fail the build — leave any prior data file in place
  process.exit(0);
});
