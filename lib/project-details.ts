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
  {
    slug: 'ai-life-progress-coach',
    philosophy:
      'Personal productivity tools often stop at capture. This project treats long-term growth as a system of evidence: goals, daily execution, recovery, review, and AI feedback all remain connected.',
    problem:
      'People can track tasks for a few days, but long-range progress breaks down when goals, mood, journals, reviews, and next actions live in separate tools.',
    approach:
      'I built a local-first AI life operating system that turns personal data into daily and weekly feedback loops while keeping sensitive notes under user control.',
    outcome:
      'The project demonstrates a broad product surface, privacy-aware architecture, and 830+ tests around a personal AI workflow that has to be both useful and trustworthy.',
    role: [
      'Designed the goal-to-review workflow and the product information architecture.',
      'Implemented the Next.js application, local data model, encryption path, and AI review surfaces.',
      'Balanced motivational UX with privacy constraints so the app can be useful without exposing raw journals.',
    ],
    architecture:
      'Next.js app with a local-first data layer, typed domain models, and AI review modules over bounded personal context. The system separates raw private entries from shareable summaries so progress evidence can be reviewed without leaking sensitive detail.',
    notes: [
      'Local-first posture keeps the product credible for personal data.',
      'Daily, weekly, and monthly reviews create repeated feedback rather than one-off AI advice.',
      'Test coverage is unusually strong for a personal product prototype, which makes it useful evidence of engineering discipline.',
    ],
    stack: [
      { name: 'Next.js', role: 'Full-stack product surface' },
      { name: 'TypeScript', role: 'Domain model and UI safety' },
      { name: 'Prisma', role: 'Structured local data layer' },
      { name: 'Vitest', role: 'Regression coverage' },
      { name: 'AES-GCM', role: 'Local privacy boundary' },
    ],
    references: ['launchlens-ai', 'model-eval-studio'],
  },
  {
    slug: 'CampusTradeAI',
    philosophy:
      'A campus marketplace is not only a listing feed. The harder work is trust, moderation, payment boundaries, account growth, and the operating tools that keep the marketplace healthy.',
    problem:
      'Student trading products often fail because they model supply and demand but underbuild identity, reporting, chat, moderation, and post-launch operations.',
    approach:
      'I organized the mini-program around real marketplace workflows: idle-item selling, wanted posts, campus services, shop pages, messaging, reporting, campus coin incentives, and admin review.',
    outcome:
      'The project is valuable as a complex business-flow case: 1,400+ tracked files across mini-program UI, cloud functions, server modules, and operational workflows.',
    role: [
      'Designed the marketplace feature map and user journeys.',
      'Implemented mini-program pages, cloud-function boundaries, and server-side support modules.',
      'Practiced product tradeoffs around trust, moderation, growth, and mobile usability.',
    ],
    architecture:
      'WeChat mini-program front end with cloud functions and server modules behind the main marketplace actions. The system splits buyer/seller flows, moderation workflows, and operational data into separate modules rather than a single monolithic screen.',
    notes: [
      'The case is framed around marketplace operations instead of only item listing.',
      'Trust, reporting, chat, incentives, and moderation are treated as core product mechanics.',
      'The strongest evidence is workflow breadth: multiple roles, states, and operational loops working in one mobile product.',
    ],
    stack: [
      { name: 'WeChat Mini Program', role: 'Mobile product surface' },
      { name: 'JavaScript / TypeScript', role: 'Client and service logic' },
      { name: 'Cloud Functions', role: 'Business workflow boundaries' },
      { name: 'Node.js', role: 'Server support modules' },
      { name: 'Marketplace Ops', role: 'Moderation and growth loops' },
    ],
    references: ['ai-life-progress-coach'],
  },
  {
    slug: 'vision-centric-financial-swarm',
    philosophy:
      'Financial documents are visual artifacts. Tables, charts, page layout, and multi-page references are part of the answer, so treating PDFs as plain text throws away signal before retrieval begins.',
    problem:
      'Traditional RAG pipelines struggle with annual reports and investor decks because the critical evidence often lives in tables, figures, and page regions that text chunking destroys.',
    approach:
      'I built a multi-modal RAG prototype around ColPali-style visual retrieval, ROI cropping, and agentic verification over financial document evidence.',
    outcome:
      'This is the strongest candidate to add as a research-system project: it connects multi-modal retrieval, financial reasoning, and agent orchestration in one coherent case.',
    role: [
      'Modeled the document pipeline around page-level visual retrieval rather than text-only chunks.',
      'Designed the agent loop for research, inspection, and cross-page verification.',
      'Kept the presentation grounded in evidence paths and bounded claims rather than generic AI chat output.',
    ],
    architecture:
      'Document pages are embedded as visual evidence, retrieved with multi-vector representations, cropped into regions of interest, and passed to downstream reasoning steps. The agent layer separates retrieval, inspection, synthesis, and verification so the final answer can point back to visual evidence.',
    notes: [
      'Visual retrieval keeps layout signal that text chunking often discards.',
      'ROI cropping is framed as a cost-control and evidence-focus mechanism for vision model calls.',
      'This project complements Structure-Aware RAG by moving from document structure to visual document understanding.',
    ],
    stack: [
      { name: 'Python', role: 'Research pipeline' },
      { name: 'ColPali-style Retrieval', role: 'Vision-centric document search' },
      { name: 'LangGraph', role: 'Agent orchestration' },
      { name: 'FastAPI', role: 'Service boundary' },
      { name: 'Next.js', role: 'Review interface' },
    ],
    references: ['LangGraph-Financial-Swarm', 'structure-aware-rag-empirical'],
  },
  {
    slug: 'deepnerve-3d',
    philosophy:
      'Medical AI prototypes should be judged by problem framing, constraints, and reproducible pipelines. The goal is not to overclaim clinical performance, but to show disciplined research engineering.',
    problem:
      'Mandibular nerve segmentation in CBCT is difficult because the target is tiny, low-contrast, and topologically continuous; a visually plausible mask can still fail if the nerve path breaks.',
    approach:
      'I used a SwinUNETR-based 3D segmentation pipeline with sliding-window inference, class-imbalance awareness, and topology-oriented post-processing constraints.',
    outcome:
      'The project adds a credible medical-imaging research case to the portfolio and shows that the AI direction is broader than web products alone.',
    role: [
      'Built the research-style training and inference pipeline.',
      'Framed the task around foreground scarcity, topology continuity, and compute limits.',
      'Presented the work as an engineering prototype with explicit constraints rather than a clinical claim.',
    ],
    architecture:
      'PyTorch and MONAI pipeline for 3D CBCT volumes. SwinUNETR captures long-range anatomical context, sliding-window inference handles memory limits, and connected-component logic reduces fragmented false positives in post-processing.',
    notes: [
      'Topology matters because a locally plausible mask can still be wrong if the nerve path breaks.',
      'Sliding-window inference and post-processing make the pipeline practical under limited GPU memory.',
      'The case adds research depth to the applied product projects without overclaiming clinical readiness.',
    ],
    stack: [
      { name: 'PyTorch', role: 'Model training' },
      { name: 'MONAI', role: 'Medical-imaging pipeline' },
      { name: 'SwinUNETR', role: '3D segmentation backbone' },
      { name: 'SimpleITK', role: 'Volume IO and preprocessing' },
      { name: 'Sliding Window Inference', role: '8GB-VRAM friendly inference' },
    ],
    references: ['safety-critical-battery-prognostics'],
  },
];

/** Lookup helper. */
export function getProjectDetail(slug: string): ProjectDetail | undefined {
  return PROJECT_DETAILS.find((d) => d.slug === slug);
}
