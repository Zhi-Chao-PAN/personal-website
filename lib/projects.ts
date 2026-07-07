/**
 * Static project metadata — the build script (scripts/fetch-projects.mjs) reads
 * this META array, hits the GitHub API for each slug, and writes the merged
 * result to data/projects.generated.json. Components only import the JSON.
 *
 * scripts/fetch-projects.mjs owns the final on-page display order.
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
  /** Null hides the repo link until the repository is intentionally public. */
  publicRepoUrl?: string | null;
  /** Chinese reader-facing pitch rendered on project cards and case pages. */
  pitchZh?: string;
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
  {
    slug: 'ai-life-progress-coach',
    displayName: 'AI Life Progress Coach',
    demoUrl: null,
    publicRepoUrl: null,
    taglineOverride: 'Local-first AI life operating system — goals, tasks, reviews, and privacy-safe progress evidence.',
    fallbackStars: 0,
    fallbackTopics: ['ai-coach', 'life-os', 'nextjs', 'local-first'],
    fallbackLanguage: 'TypeScript',
    headline: { label: 'tests', value: '830+' },
    references: ['launchlens-ai', 'model-eval-studio'],
    imageType: 'og-poster',
    imageLabel: 'CASE POSTER',
    pitchZh:
      '它不是又一个待办清单，而是把长期目标拆成每天可执行、可复盘、可解释的成长系统。任务、日记、恢复状态、周/月回顾和 AI 建议落在同一条证据链里，用户能看到自己为什么在前进、哪里卡住、下一步该做什么。',
  },
  {
    slug: 'CampusTradeAI',
    displayName: 'CampusTradeAI',
    demoUrl: null,
    publicRepoUrl: null,
    taglineOverride: 'Campus marketplace mini-program — trading, trust, moderation, payment gates, and ops workflows.',
    fallbackStars: 0,
    fallbackTopics: ['wechat-miniprogram', 'marketplace', 'cloud-functions', 'campus'],
    fallbackLanguage: 'JavaScript',
    headline: { label: 'files', value: '1.4k' },
    references: ['ai-life-progress-coach'],
    imageType: 'og-poster',
    imageLabel: 'CASE POSTER',
    pitchZh:
      '校园二手交易不是一个商品列表就够了，真正难的是信任、审核、增长、支付边界和运营闭环。CampusTradeAI 把闲置交易、求购、校园服务、聊天、举报审核、校园币、店铺和运营体检组织成一套小程序系统，展示复杂业务流和移动端产品落地能力。',
  },
  {
    slug: 'vision-centric-financial-swarm',
    displayName: 'Vision-Centric Financial Swarm',
    demoUrl: null,
    publicRepoUrl: null,
    taglineOverride: 'Multi-modal financial RAG — ColPali retrieval, ROI cropping, and agentic verification.',
    fallbackStars: 0,
    fallbackTopics: ['multimodal-rag', 'colpali', 'finance', 'langgraph'],
    fallbackLanguage: 'Python',
    headline: { label: 'token cost', value: '-80%' },
    references: ['LangGraph-Financial-Swarm', 'structure-aware-rag-empirical'],
    imageType: 'og-poster',
    imageLabel: 'CASE POSTER',
    pitchZh:
      '传统 RAG 把 PDF 当文本拆，最容易丢掉图表、表格和页面布局。这个项目直接把财报页面当视觉对象处理：用 ColPali 做多向量检索，再通过 ROI 裁剪把关键区域送给视觉模型，最后由 agent 做跨页推理和数值校验。',
  },
  {
    slug: 'deepnerve-3d',
    displayName: 'DeepNerve-3D',
    demoUrl: null,
    publicRepoUrl: null,
    taglineOverride: 'Research-style 3D medical segmentation — SwinUNETR, topology constraints, and CBCT nerve tracing.',
    fallbackStars: 0,
    fallbackTopics: ['medical-imaging', 'segmentation', 'pytorch', 'monai'],
    fallbackLanguage: 'Python',
    headline: { label: 'foreground', value: '<0.1%' },
    references: ['safety-critical-battery-prognostics'],
    imageType: 'og-poster',
    imageLabel: 'CASE POSTER',
    pitchZh:
      '这个项目的价值不在炫界面，而在把困难的医学影像问题讲清楚：3D CBCT 中下牙槽神经前景极少、对比度低、拓扑连续性要求高。DeepNerve-3D 用 SwinUNETR、滑窗推理和连通域约束，把研究思路落到可运行的分割 pipeline 里。',
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
