#!/usr/bin/env node
/**
 * fetch-stack.mjs
 *
 * Build-time script: for each project, read package.json (Node) or
 * pyproject.toml (Python) from the GitHub contents API and extract the
 * top 3 runtime dependencies. Writes data/stacks.generated.json.
 *
 * No GitHub token needed for public repos (~7 requests).
 * Falls back to empty array on any failure.
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const GITHUB_API = 'https://api.github.com';
const TIMEOUT_MS = 8000;
const GITHUB_OWNER = 'Zhi-Chao-PAN';

// Same META as fetch-projects.mjs
const META = [
  { slug: 'launchlens-ai', lang: 'ts' },
  { slug: 'launchlens-research-studio', lang: 'ts' },
  { slug: 'model-eval-studio', lang: 'ts' },
  { slug: 'codex-zcode-remote-relay', lang: 'js' },
  { slug: 'LangGraph-Financial-Swarm', lang: 'py' },
  { slug: 'safety-critical-battery-prognostics', lang: 'py' },
  { slug: 'structure-aware-rag-empirical', lang: 'py' },
];

// Fallback stacks for repos that have no manifest (pure script projects).
const FALLBACK_STACKS = {
  'codex-zcode-remote-relay': [
    { name: 'node', source: 'manual' },
    { name: 'json-rpc', source: 'manual' },
    { name: 'websocket', source: 'manual' },
  ],
};

// Prefer these package names when they show up (frameworks > libs > tools)
const TS_PREFERRED_ORDER = [
  'next', 'react', 'react-dom', 'vue', 'svelte', 'nuxt',
  'tailwindcss', 'gsap', '@gsap/react', 'lenis', 'split-type',
  'zustand', 'jotai', 'redux', '@reduxjs/toolkit',
  'tanstack/react-query', '@tanstack/react-query', 'swr',
  'zod', 'yup', 'valibot',
  'prisma', 'drizzle-orm', 'mongoose',
  'three', '@react-three/fiber', 'framer-motion', 'motion',
  'openai', '@anthropic-ai/sdk', '@google/generative-ai',
  'typescript', 'eslint', 'prettier', 'vitest', '@playwright/test',
  'clsx', 'class-variance-authority', 'tailwind-merge',
];

const PY_PREFERRED_ORDER = [
  'torch', 'pytorch-lightning',
  'transformers', 'langchain', 'langgraph', 'llama-index', 'llama-index-core',
  'openai', 'anthropic', 'google-generativeai',
  'numpy', 'pandas', 'scipy', 'scikit-learn', 'matplotlib', 'seaborn', 'plotly',
  'pydantic', 'pydantic-settings',
  'fastapi', 'flask', 'django', 'uvicorn', 'gunicorn',
  'httpx', 'aiohttp', 'requests',
  'pytest', 'pytest-asyncio', 'black', 'ruff', 'mypy',
  'streamlit', 'gradio', 'jupyter', 'ipykernel',
  'crewai', 'autogen', 'ag2',
  'ollama', 'vllm', 'tiktoken',
  'conformal-prediction', 'mapie',
];

function pickTop(deps, order) {
  const keys = Object.keys(deps);
  // First: any dependency that appears in the preferred order, in that order
  const preferred = order.filter((k) => keys.includes(k));
  // Then: any other dep, sorted alphabetically, skipping types/eslint/dev-only
  const others = keys
    .filter((k) => !preferred.includes(k))
    .filter((k) => !k.startsWith('@types/'))
    .filter((k) => !k.startsWith('eslint-'))
    .filter((k) => k !== 'eslint')
    .filter((k) => !k.startsWith('prettier-'))
    .sort();
  return [...preferred, ...others].slice(0, 4);
}

function cleanName(name) {
  // Drop @types/ and similar prefixes for display
  return name.replace(/^@types\//, '');
}

async function fetchFile(slug, path) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${GITHUB_API}/repos/${GITHUB_OWNER}/${slug}/contents/${path}`, {
      headers: {
        'User-Agent': 'panzhichao-portfolio-fetch',
        'Accept': 'application/vnd.github+json',
      },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.content) return null;
    return Buffer.from(json.content, 'base64').toString('utf8');
  } catch (err) {
    console.warn(`[fetch-stack] ${slug}/${path}: ${err.message}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function parsePackageJsonDeps(text) {
  try {
    const pkg = JSON.parse(text);
    // Use only runtime dependencies; fall back to peerDependencies
    const deps = { ...(pkg.dependencies ?? {}), ...(pkg.peerDependencies ?? {}) };
    return deps;
  } catch {
    return null;
  }
}

function parsePyprojectDeps(text) {
  // Look for either PEP 621 [project].dependencies = [...] or poetry [tool.poetry.dependencies]
  // PEP 621 first
  const pep621 = text.match(/\[project\][\s\S]*?dependencies\s*=\s*\[([\s\S]*?)\]/);
  if (pep621) {
    const block = pep621[1];
    const names = [...block.matchAll(/["']([a-zA-Z0-9_.-]+)(?:\[.*?\])?/g)].map((m) => m[1]);
    return Object.fromEntries(names.map((n) => [n, '*']));
  }
  // Poetry fallback
  const poetry = text.match(/\[tool\.poetry\.dependencies\]([\s\S]*?)(?=\[|$)/);
  if (poetry) {
    const block = poetry[1];
    const names = [...block.matchAll(/^([a-zA-Z0-9_.-]+)\s*=/gm)].map((m) => m[1]);
    return Object.fromEntries(names.map((n) => [n, '*']));
  }
  return null;
}

function parseRequirementsTxt(text) {
  const names = text
    .split('\n')
    .map((line) => line.split('#')[0].trim())
    .filter((line) => line && !line.startsWith('-'))
    .map((line) => line.split(/[=<>~!\[]/)[0].trim())
    .filter(Boolean);
  return Object.fromEntries(names.map((n) => [n, '*']));
}

async function fetchStackForRepo(meta) {
  // Try the manifest that matches the primary language, then fallbacks.
  const attempts = meta.lang === 'ts'
    ? [['package.json', parsePackageJsonDeps], ['requirements.txt', parseRequirementsTxt], ['pyproject.toml', parsePyprojectDeps]]
    : meta.lang === 'js'
    ? [['package.json', parsePackageJsonDeps], ['requirements.txt', parseRequirementsTxt], ['pyproject.toml', parsePyprojectDeps]]
    : [['pyproject.toml', parsePyprojectDeps], ['requirements.txt', parseRequirementsTxt], ['package.json', parsePackageJsonDeps]];

  for (const [path, parser] of attempts) {
    const text = await fetchFile(meta.slug, path);
    if (!text) continue;
    const deps = parser(text);
    if (deps && Object.keys(deps).length > 0) {
      const order = meta.lang === 'py' ? PY_PREFERRED_ORDER : TS_PREFERRED_ORDER;
      return pickTop(deps, order);
    }
  }
  return [];
}

async function main() {
  console.log('[fetch-stack] Fetching stacks for 7 repos...');
  const started = Date.now();

  const entries = await Promise.all(META.map(async (meta) => {
    let top = await fetchStackForRepo(meta);
    let source = meta.lang === 'py' ? 'pyproject' : 'package.json';
    if (top.length === 0 && FALLBACK_STACKS[meta.slug]) {
      top = FALLBACK_STACKS[meta.slug].map((s) => s.name);
      source = 'manual';
    }
    return [meta.slug, top.map((name) => ({ name: cleanName(name), source }))];
  }));

  const stacks = Object.fromEntries(entries);

  const output = {
    generatedAt: new Date().toISOString(),
    source: 'github-contents-api',
    stacks,
  };

  const outPath = join(ROOT, 'data', 'stacks.generated.json');
  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, JSON.stringify(output, null, 2) + '\n', 'utf8');

  const elapsed = Date.now() - started;
  console.log(`[fetch-stack] Wrote ${Object.keys(stacks).length} stacks → ${outPath} (${elapsed}ms)`);
  for (const [slug, deps] of entries) {
    console.log(`  ${slug}: ${deps.map((d) => d.name).join(', ') || '(none)'}`);
  }
}

main().catch((err) => {
  console.error('[fetch-stack] Fatal:', err);
  process.exit(0);
});
