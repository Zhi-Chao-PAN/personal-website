/**
 * Static project metadata — the build script (scripts/fetch-projects.mjs) reads
 * this META array, hits the GitHub API for each slug, and writes the merged
 * result to data/projects.generated.json. Components only import the JSON.
 *
 * The order here defines the on-page order (live demos first, then by recency).
 */
import type { ProjectLanguage, ProjectHeadline } from './projects.types';

export interface ProjectMeta {
  slug: string;
  /** Canonical display name (overrides GitHub repo name when needed). */
  displayName: string;
  /** Hard-coded demo URL — GitHub's homepage field is unreliable. */
  demoUrl: string | null;
  /** Manual tagline override; falls back to GitHub description if blank. */
  taglineOverride?: string;
  /** Pre-push fallback stars (used when GitHub API fails or rate-limits). */
  fallbackStars: number;
  /** Pre-push fallback topics (used when GitHub API fails). */
  fallbackTopics: string[];
  /** Pre-push fallback language. */
  fallbackLanguage: ProjectLanguage;
  /** Hand-curated headline metric (null = no headline on card). */
  headline: ProjectHeadline | null;
  /** Cross-references to other project slugs. */
  references: string[];
  /** Type of cover image — affects the corner label. */
  imageType: 'screenshot' | 'benchmark' | 'og-poster';
  /** Display label for the cover image. */
  imageLabel: string;
}

export const GITHUB_OWNER = 'Zhi-Chao-PAN';

/** Contact email — the canonical address shown across the site (About + Outro). */
export const CONTACT_EMAIL = '18652585856@163.com';

export const LANGUAGE_COLORS: Record<ProjectLanguage, string> = {
  TypeScript: '#3178c6',
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  Other: '#8b8b8b',
};

/** Full GitHub language palette (used by language breakdown bar). */
export const GITHUB_LANGUAGE_PALETTE: Record<string, string> = {
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

export const META: ProjectMeta[] = [
  {
    slug: 'launchlens-ai',
    displayName: 'LaunchLens AI',
    demoUrl: 'https://launchlens-ai-two.vercel.app',
    taglineOverride: 'AI-powered go-to-market workspace — research, positioning & GTM briefs.',
    fallbackStars: 1,
    fallbackTopics: ['nextjs', 'ai', 'typescript', 'tailwindcss'],
    fallbackLanguage: 'TypeScript',
    headline: { label: 'release', value: 'v1.0.0' },
    references: ['launchlens-research-studio'],
    imageType: 'screenshot',
    imageLabel: 'DESKTOP',
  },
  {
    slug: 'launchlens-research-studio',
    displayName: 'LaunchLens Research Studio',
    demoUrl: 'https://launchlens-research-studio.vercel.app',
    taglineOverride: 'Multi-agent market intelligence — 6 AI agents research any product in parallel.',
    fallbackStars: 0,
    fallbackTopics: ['multi-agent', 'nextjs', 'typescript'],
    fallbackLanguage: 'TypeScript',
    headline: { label: 'tests passing', value: '1,423' },
    references: ['launchlens-ai'],
    imageType: 'screenshot',
    imageLabel: 'DARK MODE',
  },
  {
    slug: 'model-eval-studio',
    displayName: 'Model Eval Studio',
    demoUrl: 'https://model-test-assistant.vercel.app',
    taglineOverride: 'Multi-model evaluation workspace — AI identifies models from screenshots & generates comparison reports.',
    fallbackStars: 0,
    fallbackTopics: ['ai', 'evaluation', 'typescript'],
    fallbackLanguage: 'TypeScript',
    headline: null,
    references: [],
    imageType: 'og-poster',
    imageLabel: 'OG POSTER',
  },
  {
    slug: 'codex-zcode-remote-relay',
    displayName: 'Codex ↔ ZCode Remote Relay',
    demoUrl: null,
    taglineOverride: 'Local Codex-to-ZCode multi-agent relay — bounded delegation, worker pools, safety gates.',
    fallbackStars: 0,
    fallbackTopics: ['multi-agent', 'nodejs', 'zcode', 'codex'],
    fallbackLanguage: 'JavaScript',
    headline: { label: 'lines of code', value: '< 1k' },
    references: [],
    imageType: 'og-poster',
    imageLabel: 'OG POSTER',
  },
  {
    slug: 'LangGraph-Financial-Swarm',
    displayName: 'LangGraph Financial Swarm',
    demoUrl: null,
    taglineOverride: 'Multi-agent financial research system — LangGraph orchestration, local LLMs, tool use.',
    fallbackStars: 0,
    fallbackTopics: ['langgraph', 'multi-agent', 'python', 'finance'],
    fallbackLanguage: 'Python',
    headline: { label: 'specialists', value: '5 agents' },
    references: [],
    imageType: 'og-poster',
    imageLabel: 'OG POSTER',
  },
  {
    slug: 'safety-critical-battery-prognostics',
    displayName: 'Safety-Critical Battery Prognostics',
    demoUrl: null,
    taglineOverride: 'Reproducible battery RUL — three-layer physics defense, uncertainty-aware evaluation.',
    fallbackStars: 4,
    fallbackTopics: ['battery', 'pinn', 'conformal-prediction', 'pytorch'],
    fallbackLanguage: 'Python',
    headline: { label: '3-layer defense', value: 'VR 0.00%' },
    references: [],
    imageType: 'benchmark',
    imageLabel: 'BENCHMARK',
  },
  {
    slug: 'structure-aware-rag-empirical',
    displayName: 'Structure-Aware RAG (Empirical)',
    demoUrl: null,
    taglineOverride: 'Empirical study — Structure-Aware Parsing lifts Financial RAG accuracy by 37.5%.',
    fallbackStars: 0,
    fallbackTopics: ['rag', 'llamaindex', 'nlp', 'benchmark'],
    fallbackLanguage: 'Python',
    headline: { label: 'accuracy lift', value: '+37.5%' },
    references: [],
    imageType: 'benchmark',
    imageLabel: 'BENCHMARK',
  },
];

/**
 * Truncate a description to a single-sentence tagline.
 * Strips trailing punctuation noise, takes the first sentence,
 * and clamps to maxLen characters.
 */
export function buildTagline(description: string | null, maxLen = 110): string {
  if (!description) return '';
  // First sentence (split on . ! ? followed by space or end)
  const firstSentence = description.split(/(?<=[.!?])\s+/)[0] ?? description;
  if (firstSentence.length <= maxLen) return firstSentence;
  // Otherwise clamp to maxLen at the nearest word boundary
  const trimmed = firstSentence.slice(0, maxLen);
  const lastSpace = trimmed.lastIndexOf(' ');
  return (lastSpace > 40 ? trimmed.slice(0, lastSpace) : trimmed).trimEnd() + '…';
}

/** Human-readable relative time, e.g. "2d ago" / "3mo ago" / "1y ago". */
export function relativeTime(iso: string, now: Date = new Date()): string {
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

/** Human-readable file size, e.g. "4.6 MB" / "75 KB" / "1.2 GB". */
export function humanSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(gb < 10 ? 1 : 0)} GB`;
}
