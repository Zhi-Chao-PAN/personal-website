/**
 * Static project metadata — the build script (scripts/fetch-projects.mjs) reads
 * this META array, hits the GitHub API for each slug, and writes the merged
 * result to data/projects.generated.json. Components only import the JSON.
 *
 * The order here defines the on-page order (live demos first, then by recency).
 */
import type { ProjectLanguage } from './projects.types';

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
}

export const GITHUB_OWNER = 'Zhi-Chao-PAN';

export const LANGUAGE_COLORS: Record<ProjectLanguage, string> = {
  TypeScript: '#3178c6',
  Python: '#3572A5',
  JavaScript: '#f1e05a',
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
  },
  {
    slug: 'launchlens-research-studio',
    displayName: 'LaunchLens Research Studio',
    demoUrl: 'https://launchlens-research-studio.vercel.app',
    taglineOverride: 'Multi-agent market intelligence — 6 AI agents research any product in parallel.',
    fallbackStars: 0,
    fallbackTopics: ['multi-agent', 'nextjs', 'typescript'],
    fallbackLanguage: 'TypeScript',
  },
  {
    slug: 'model-eval-studio',
    displayName: 'Model Eval Studio',
    demoUrl: 'https://model-test-assistant.vercel.app',
    taglineOverride: 'Multi-model evaluation workspace — AI identifies models from screenshots & generates comparison reports.',
    fallbackStars: 0,
    fallbackTopics: ['ai', 'evaluation', 'typescript'],
    fallbackLanguage: 'TypeScript',
  },
  {
    slug: 'codex-zcode-remote-relay',
    displayName: 'Codex ↔ ZCode Remote Relay',
    demoUrl: null,
    taglineOverride: 'Local Codex-to-ZCode multi-agent relay — bounded delegation, worker pools, safety gates.',
    fallbackStars: 0,
    fallbackTopics: ['multi-agent', 'nodejs', 'zcode', 'codex'],
    fallbackLanguage: 'JavaScript',
  },
  {
    slug: 'LangGraph-Financial-Swarm',
    displayName: 'LangGraph Financial Swarm',
    demoUrl: null,
    taglineOverride: 'Multi-agent financial research system — LangGraph orchestration, local LLMs, tool use.',
    fallbackStars: 0,
    fallbackTopics: ['langgraph', 'multi-agent', 'python', 'finance'],
    fallbackLanguage: 'Python',
  },
  {
    slug: 'safety-critical-battery-prognostics',
    displayName: 'Safety-Critical Battery Prognostics',
    demoUrl: null,
    taglineOverride: 'Reproducible battery RUL — three-layer physics defense, uncertainty-aware evaluation.',
    fallbackStars: 4,
    fallbackTopics: ['battery', 'pinn', 'conformal-prediction', 'pytorch'],
    fallbackLanguage: 'Python',
  },
  {
    slug: 'structure-aware-rag-empirical',
    displayName: 'Structure-Aware RAG (Empirical)',
    demoUrl: null,
    taglineOverride: 'Empirical study — Structure-Aware Parsing lifts Financial RAG accuracy by 37.5%.',
    fallbackStars: 0,
    fallbackTopics: ['rag', 'llamaindex', 'nlp', 'benchmark'],
    fallbackLanguage: 'Python',
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
