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
  /** The practical problem this project is trying to solve. */
  problem: string;
  /** The product or system approach used to solve it. */
  approach: string;
  /** The clearest outcome, proof point, or measurable signal. */
  outcome: string;
  /** What ZhiChao personally owned or practiced in the project. */
  role: string[];
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
    problem:
      'Early founders often need a first GTM brief before they can afford a research team, but generic AI drafts miss market structure, positioning, and decision-ready evidence.',
    approach:
      'I turned the workflow into a guided product system: capture the business context, run structured agent steps, validate each output, and render the result as a founder-ready workspace.',
    outcome:
      'The project behaves like a repeatable GTM cockpit instead of a one-off prompt demo, with a public v1.0 release and a live deployment.',
    role: [
      'Designed the end-to-end product flow from intake to GTM brief.',
      'Built the Next.js interface, generated project data pipeline, and release-oriented metadata.',
      'Focused the system on structured outputs that can be reviewed, revised, and reused.',
    ],
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
    problem:
      'A single long-context agent tends to blur market, competitor, persona, pricing, channel, and risk research into one fragile answer.',
    approach:
      'I split research into specialist agents, ran them in parallel, and merged their outputs into a structured brief so each dimension can fail, recover, and improve independently.',
    outcome:
      'The result demonstrates bounded delegation, partial-failure tolerance, and faster decision loops for applied multi-agent research.',
    role: [
      'Designed the fan-out/fan-in agent architecture.',
      'Built the schema-driven brief renderer and project workflow.',
      'Tuned the visible product language around evidence, not just automation.',
    ],
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
    problem:
      'Teams often choose models from screenshots, third-party claims, or scattered traces without a repeatable way to compare quality, cost, and latency.',
    approach:
      'I framed evaluation as a workspace: identify the artifact, extract comparable signals, and produce reports that can be diffed across models and runs.',
    outcome:
      'The project shows how model selection can move from vibes to an auditable comparison flow with clearer cost-per-quality tradeoffs.',
    role: [
      'Designed the evaluation workflow and comparison report shape.',
      'Built the interactive Next.js UI and result surfaces.',
      'Centered the product around practical model choice rather than abstract leaderboard scores.',
    ],
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
    problem:
      'Multi-agent coding sounds simple until ownership, model selection, cost control, job recovery, and conflicting edits all become operational problems.',
    approach:
      'I built a local relay protocol where Codex schedules bounded tasks, ZCode workers execute them, and Codex reviews results through explicit ledgers and validation gates.',
    outcome:
      'The system turned ad hoc assistant handoffs into an auditable local worker loop with job ids, model routing, status collection, and acceptance decisions.',
    role: [
      'Designed the commander/worker protocol and safety rules.',
      'Built the Node.js relay scripts for dispatch, status, collection, and pool reporting.',
      'Validated the workflow on real coding tasks with explicit acceptance gates.',
    ],
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
    problem:
      'Investment research needs traceable specialist reasoning, but a single model answer often mixes assumptions, sources, and risk judgments into an opaque narrative.',
    approach:
      'I modeled the workflow as a LangGraph state machine with specialist nodes, shared state, checkpointing, and a final arbiter step.',
    outcome:
      'The project demonstrates how financial analysis can become replayable, branchable, and easier to audit when agent roles are explicit.',
    role: [
      'Modeled the specialist-agent workflow and shared state transitions.',
      'Built the local-first Python orchestration flow.',
      'Focused the architecture on replayability, isolation, and analyst trust.',
    ],
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
    problem:
      'Battery RUL prediction is safety-sensitive: overconfident point estimates can create maintenance, warranty, and operational risk.',
    approach:
      'I combined physics-informed modeling, safety bounds, uncertainty quantification, and separated synthetic versus real-data reporting.',
    outcome:
      'The project makes the model accountable: predictions carry uncertainty, evaluation remains reproducible, and unsafe claims are explicitly bounded.',
    role: [
      'Built the reproducible modeling and evaluation pipeline.',
      'Separated benchmark, real-data, and safety reporting paths.',
      'Used uncertainty as a product requirement, not an afterthought.',
    ],
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
    problem:
      'RAG failures in financial documents often come from broken document structure, especially tables, rather than from the language model itself.',
    approach:
      'I ran a controlled parser comparison with frozen model settings, identical questions, and human-verified scoring for table-cell reasoning.',
    outcome:
      'The study reports a 37.5% relative accuracy lift from structure-aware parsing, giving RAG builders a concrete engineering lever to improve retrieval quality.',
    role: [
      'Designed the parser-controlled benchmark and evaluation protocol.',
      'Implemented reproducible RAG experiments and scoring scripts.',
      'Translated the result into an engineering recommendation for document pipelines.',
    ],
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
