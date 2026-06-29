/**
 * Hand-authored project dossiers — philosophy, architecture, gotchas, and
 * additional metadata rendered inside the project detail modal.
 *
 * Voice: technical, restrained, third-person engineering. No marketing fluff.
 * ~30-60 words per field, ~5 bullet points per stack section.
 */

export interface ProjectDetail {
  slug: string;
  /** 1-2 sentences: what this project is, who it's for. */
  philosophy: string;
  /** 2-3 sentences: the core architecture or mechanism. */
  architecture: string;
  /** Notable engineering details / tradeoffs. */
  notes: string[];
  /** Ordered list of stack entries (most important first). 4-6 items. */
  stack: StackItem[];
  /** Cross-references — related project slugs (renders as clickable chips). */
  references?: string[];
}

export interface StackItem {
  /** Display name (e.g. "Next.js 16 (App Router)"). */
  name: string;
  /** Role / why it's used (e.g. "Routing + RSC"). */
  role: string;
}

export const PROJECT_DETAILS: ProjectDetail[] = [
  {
    slug: 'launchlens-ai',
    philosophy:
      'Go-to-market should be an engineering problem, not a copywriting one — research, positioning, and GTM briefs decomposed into a reusable agent workflow that any founder can run in 10 minutes.',
    architecture:
      'Multi-step agent pipeline over a typed product context. Each step has a structured output schema (Zod), gets validated, and feeds the next. Built on Next.js 16 App Router with React 19 server actions for the long-running agent calls.',
    notes: [
      'Typed output schemas — every agent step validates against Zod before continuing, so the UI can render progressively without re-asking.',
      'Streaming responses via React 19 use() + Suspense boundaries — no waiting for the full agent to finish.',
      'Command palette (⌘K) for jumping between products, briefs, and research sessions — keyboard-first design.',
    ],
    stack: [
      { name: 'Next.js 16', role: 'App Router + RSC + Turbopack' },
      { name: 'React 19.2', role: 'Server actions + use() streaming' },
      { name: 'TypeScript 5', role: 'End-to-end type safety' },
      { name: 'Tailwind CSS 4', role: 'Styling' },
      { name: 'Zod 3', role: 'Agent output validation' },
      { name: 'GSAP 3.14 + Lenis 1.3', role: 'Hero + smooth scroll' },
    ],
    references: ['launchlens-research-studio'],
  },
  {
    slug: 'launchlens-research-studio',
    philosophy:
      'Pushing a single agent to its limits is the wrong tradeoff — six small specialist agents running in parallel each finish in under 30 seconds, and the merge step produces a better brief than a single long-context call.',
    architecture:
      'Fan-out / fan-in topology. A coordinator dispatches six research subagents (market, competitor, persona, pricing, channels, risks) that run concurrently with isolated contexts. Results merge into a structured GTM brief validated against a Zod schema.',
    notes: [
      'Parallel execution via Promise.allSettled — no subagent blocks another; partial failures degrade gracefully.',
      'Isolated context windows per agent — keeps token usage bounded and prevents cross-contamination of research threads.',
      'Brief renderer is fully schema-driven — adding a new research dimension means adding a Zod field, not a new component.',
    ],
    stack: [
      { name: 'Next.js 16', role: 'App Router + server actions' },
      { name: 'React 19.2', role: 'Streaming + Suspense' },
      { name: 'TypeScript 5', role: 'Type safety' },
      { name: 'Tailwind CSS 4', role: 'Styling' },
      { name: 'Zod 3', role: 'Brief schema validation' },
    ],
    references: ['launchlens-ai'],
  },
  {
    slug: 'model-eval-studio',
    philosophy:
      'Model evaluation is engineering infrastructure, not a benchmark spreadsheet — upload a screenshot, let vision models identify the source, and surface hard metrics (latency, token cost, output quality) in a comparison report you can act on.',
    architecture:
      'Three-stage pipeline. (1) Vision models identify the model in the uploaded artifact. (2) Hard metrics are extracted from the trace or the artifact itself. (3) A structured report is generated and persisted for diffing across runs.',
    notes: [
      'Vision-first identification — supports screenshots, charts, terminal output, and rendered UI without prior labeling.',
      'Comparison diffing — runs are versioned; you can see how the same model changed across deploys.',
      'Cost-per-quality scoring — surfaces the Pareto frontier, not just the leaderboard.',
    ],
    stack: [
      { name: 'Next.js 16', role: 'App Router' },
      { name: 'React 19.2', role: 'UI' },
      { name: 'TypeScript 5', role: 'Type safety' },
      { name: 'Tailwind CSS 4', role: 'Styling' },
    ],
  },
  {
    slug: 'codex-zcode-remote-relay',
    philosophy:
      'Expensive models should be quota-managed. The relay protocol lets a Codex orchestrator delegate bounded sub-tasks to a pool of ZCode workers — the orchestrator keeps the high-level plan, workers burn the tokens.',
    architecture:
      'JSON-RPC over local WebSocket. The orchestrator posts a plan; workers claim tasks, run them, and stream results back. Safety gates (allowlist of action types, max token budget per task) are enforced on the relay, not the workers.',
    notes: [
      'Bounded delegation — workers can only execute actions in the safety allowlist; no arbitrary file system access.',
      'Token budget per task — relay aborts and rolls back if a worker exceeds the budget.',
      'Stateless workers — any worker can pick up any task; horizontal scaling is a config change.',
    ],
    stack: [
      { name: 'Node.js 24', role: 'Relay + worker runtime' },
      { name: 'JSON-RPC 2.0', role: 'Transport protocol' },
      { name: 'WebSocket', role: 'Streaming channel' },
    ],
  },
  {
    slug: 'LangGraph-Financial-Swarm',
    philosophy:
      'Financial research is a conversation between specialists, not a single prompt — a LangGraph state machine orchestrates five agents (macro, equity, fundamental, sentiment, risk) that debate and refine a thesis before producing a final report.',
    architecture:
      'Stateful LangGraph workflow with shared memory. Each specialist reads the running thesis, contributes a section, and writes back. A final arbiter agent reviews coherence and produces the deliverable. All steps are checkpointed for replay.',
    notes: [
      'Stateful LangGraph — every node is checkpointed; you can resume, replay, or branch the workflow at any step.',
      'Specialist isolation — each agent has a focused system prompt and a constrained tool set, which keeps hallucinations bounded.',
      'Local LLM workflows — runs against Ollama/vLLM with no API keys; designed for analysts who can\'t ship data to the cloud.',
    ],
    stack: [
      { name: 'Python 3.11+', role: 'Runtime' },
      { name: 'LangGraph', role: 'State machine orchestration' },
      { name: 'Ollama / vLLM', role: 'Local LLM serving' },
      { name: 'Pydantic 2', role: 'State schema + validation' },
    ],
  },
  {
    slug: 'safety-critical-battery-prognostics',
    philosophy:
      'Real data has edges. Three-layer physics defense (PHM constraints, ISO-26262 bounds, conformal prediction) plus bounded real-data reporting means the RUL estimator never claims certainty it can\'t back up.',
    architecture:
      'PINN backbone constrained by equivalent-circuit physics. Conformal prediction wraps the output for distribution-free coverage guarantees. The reporting layer separates synthetic-benchmark numbers from real-data numbers — never mixed.',
    notes: [
      'Three-layer defense — physics-informed loss, ISO-26262 safety bounds, and conformal prediction coverage guarantees.',
      'Bounded real-data reporting — synthetic and real numbers live in separate files, never aggregated, never misleading.',
      'Uncertainty-aware evaluation — every metric ships with a confidence interval, not a point estimate.',
    ],
    stack: [
      { name: 'Python 3.11+', role: 'Runtime' },
      { name: 'PyTorch 2', role: 'PINN backbone' },
      { name: 'Conformal Prediction', role: 'Coverage guarantees' },
      { name: 'Jupyter', role: 'Reproducible analysis notebooks' },
    ],
  },
  {
    slug: 'structure-aware-rag-empirical',
    philosophy:
      'PDF tables are the silent killer of RAG systems. A controlled study comparing LlamaParse and PyPDF on cross-row tabular reasoning found that structure-aware parsing lifts accuracy from 50.0% to 68.8% — a 37.5% relative gain on the same model.',
    architecture:
      'Empirical benchmark with frozen model weights. Identical questions, identical retrieval, two parsers (LlamaParse vs. PyPDF). Evaluation is human-verified and scored on exact-match table cell extraction. Numbers are reported with bootstrap confidence intervals.',
    notes: [
      'Frozen-model benchmark — only the parser changes, so the lift is attributable to structure-awareness, not model quality drift.',
      'Human-verified evaluation — automated metrics can\'t catch "the cell is right but the row context is wrong" failure modes.',
      'Bootstrap CIs on all numbers — point estimates without intervals are not reported.',
    ],
    stack: [
      { name: 'Python 3.10+', role: 'Runtime' },
      { name: 'LlamaParse', role: 'Structure-aware PDF parser' },
      { name: 'PyPDF', role: 'Baseline parser' },
      { name: 'LlamaIndex', role: 'RAG orchestration' },
      { name: 'Bootstrap CI', role: 'Statistical reporting' },
    ],
  },
];

/** Lookup helper. */
export function getProjectDetail(slug: string): ProjectDetail | undefined {
  return PROJECT_DETAILS.find((d) => d.slug === slug);
}
