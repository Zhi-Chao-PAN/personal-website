"use client";

import Image from "next/image";
import { useId, useState, type ReactNode } from "react";
import examples from "@/data/public-examples.json";
import archivedAutoResearchState from "@/data/autoresearch-fresh-dev-agent-01-state.json";
import styles from "./portfolio-examples.module.css";

type Locale = "en" | "zh";
type Copy = { en: string; zh: string };
const number = (value: number, digits = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(
    value,
  );
const words = (locale: Locale, en: string, zh: string) =>
  locale === "zh" ? zh : en;

function Choices({
  id,
  label,
  options,
  value,
  onChange,
  locale,
}: {
  id: string;
  label: string;
  options: { id: string; label: Copy }[];
  value: string;
  onChange: (value: string) => void;
  locale: Locale;
}) {
  return (
    <div className={styles.choices} role="group" aria-label={label}>
      {options.map((option, index) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={value === option.id}
          data-testid={`${id}-${option.id}`}
          onClick={() => onChange(option.id)}
        >
          <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          {option.label[locale]}
        </button>
      ))}
    </div>
  );
}

function ExampleFrame({
  slug,
  locale,
  title,
  note,
  children,
  source,
  sourceLabel,
}: {
  slug: string;
  locale: Locale;
  title: string;
  note: string;
  children: ReactNode;
  source: string;
  sourceLabel?: string;
}) {
  const titleId = useId();
  return (
    <section
      className={styles.example}
      aria-labelledby={titleId}
      data-testid={`portfolio-example-${slug}`}
    >
      <header className={styles.header}>
        <p className={styles.eyebrow}>
          {words(locale, "Explore the work", "动手了解项目")}
        </p>
        <h2 id={titleId}>{title}</h2>
        <p className={styles.disclosure}>{note}</p>
      </header>
      {children}
      <footer className={styles.footer}>
        <span>{words(locale, "No account needed", "无需登录")}</span>
        <a href={source} target="_blank" rel="noreferrer">
          {sourceLabel ??
            words(locale, "Inspect the public source", "查看公开来源")}{" "}
          <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </section>
  );
}

function LaunchLensExample({ locale }: { locale: Locale }) {
  const [stepId, setStepId] = useState("brief");
  const data = examples.launchlens;
  const step = data.steps.find((item) => item.id === stepId) ?? data.steps[0];
  return (
    <ExampleFrame
      slug="launchlens-ai"
      locale={locale}
      title={words(
        locale,
        "Follow one idea into a decision",
        "跟随一个想法，走到具体决策",
      )}
      note={words(
        locale,
        "A walkthrough of the public, pre-seeded B2B SaaS sample. Evidence records are fictional demo data; no model runs here.",
        "使用公开产品中预置的 B2B SaaS 样例。证据记录为虚构演示数据；此处不调用模型。",
      )}
      source={data.source}
    >
      <Choices
        id="launchlens-step"
        label={words(locale, "Choose a walkthrough step", "选择流程步骤")}
        options={data.steps}
        value={stepId}
        onChange={setStepId}
        locale={locale}
      />
      <div className={styles.launchLayout}>
        <div className={styles.panel} data-testid="launchlens-step-content">
          <p className={styles.eyebrow}>{step.label[locale]}</p>
          <h3>{step.title[locale]}</h3>
          <p>{step.body[locale]}</p>
          {stepId === "evidence" && (
            <ul className={styles.records}>
              {data.evidence.map((record) => (
                <li key={record.id}>
                  <strong>{record.label[locale]}</strong>
                  <code>{record.id}</code>
                  <p>{record.text[locale]}</p>
                </li>
              ))}
            </ul>
          )}
          <p className={styles.callout}>{step.detail[locale]}</p>
          {stepId === "next" && (
            <a
              className={styles.actionLink}
              href="https://launchlens-ai-two.vercel.app"
              target="_blank"
              rel="noreferrer"
            >
              {words(locale, "Open LaunchLens", "打开 LaunchLens")}{" "}
              <span aria-hidden="true">↗</span>
            </a>
          )}
        </div>
        <figure className={styles.figure}>
          <a
            href={data.screenshot}
            target="_blank"
            rel="noreferrer"
            aria-label={words(
              locale,
              "Open the original LaunchLens product screenshot",
              "打开 LaunchLens 产品原始截图",
            )}
          >
            <Image
              unoptimized
              src="/images/launchlens.webp"
              alt={words(
                locale,
                "Screenshot from the public LaunchLens repository showing its product workspace",
                "公开 LaunchLens 仓库中的产品工作区截图",
              )}
              width={1200}
              height={750}
              sizes="(min-width: 900px) 42vw, 100vw"
            />
          </a>
          <figcaption>
            {words(
              locale,
              "Original product screenshot · click to enlarge. The image is a product overview, not a live view of the selected step.",
              "产品原始截图 · 点击放大。图片展示产品全貌，不会随步骤切换为实时界面。",
            )}
          </figcaption>
        </figure>
      </div>
    </ExampleFrame>
  );
}

const playbookViews = [
  { id: "task", label: { en: "Task & data", zh: "任务与数据" } },
  { id: "rules", label: { en: "The rules", zh: "评分规则" } },
  { id: "answer", label: { en: "Reference answer", zh: "参考答案" } },
  { id: "judging", label: { en: "Try the check", zh: "试试判分" } },
];

function PlaybookExample({ locale }: { locale: Locale }) {
  const [view, setView] = useState("task");
  const [answer, setAnswer] = useState(
    String(examples.playbook.demoAnswers[0]),
  );
  const inputId = useId();
  const data = examples.playbook;
  const base = data.cohorts.reduce((sum, cohort) => sum + cohort.mrr, 0);
  const churn = data.cohorts.reduce(
    (sum, cohort) => sum + cohort.mrr * cohort.churn,
    0,
  );
  const expansion = data.cohorts.reduce(
    (sum, cohort) => sum + cohort.mrr * cohort.expansion,
    0,
  );
  const expected = base - churn + expansion;
  const sensitivity =
    base -
    churn +
    data.cohorts.reduce(
      (sum, cohort) => sum + cohort.mrr * (1 - cohort.churn) * cohort.expansion,
      0,
    );
  const churnPoints = Math.round((churn / base) * 10000) / 100;
  const numericAnswer = Number(answer);
  const valid =
    answer.trim() !== "" &&
    Number.isFinite(numericAnswer) &&
    numericAnswer >= 0;
  const difference = Math.abs(numericAnswer - expected);
  const allowedDifference = expected * data.relativeTolerance;
  const passes = valid && difference <= allowedDifference;
  const drivers = [...data.cohorts]
    .sort((a, b) => b.mrr * b.churn - a.mrr * a.churn)
    .slice(0, 2);
  return (
    <ExampleFrame
      slug="llm-evaluation-playbook"
      locale={locale}
      title={words(
        locale,
        "See why an answer passes or fails",
        "看看一个答案为什么通过或不通过",
      )}
      note={words(
        locale,
        "SYNTH-SaaS-001 is fully fictional. This public teaching example shows judge material openly; real evaluation packages keep it separate from model inputs.",
        "SYNTH-SaaS-001 完全使用合成数据。这个公开教学样例展示裁判材料；真实评测包会将其与模型输入分开。",
      )}
      source={data.source}
    >
      <Choices
        id="playbook-view"
        label={words(locale, "Choose a part of the evaluation", "选择评测环节")}
        options={playbookViews}
        value={view}
        onChange={setView}
        locale={locale}
      />
      <div className={styles.panel} data-testid={`playbook-panel-${view}`}>
        {view === "task" && (
          <>
            <h3>{words(locale, "Build the revenue bridge", "计算收入变化")}</h3>
            <p>
              {words(
                locale,
                "Calculate next-quarter monthly recurring revenue (MRR), identify exactly two cohorts driving the most churn in dollars, and state when expansion is booked.",
                "计算下一季度的月度经常性收入（MRR），准确指出造成流失金额最多的两个群组，并说明扩张收入使用哪个时点的基数。",
              )}
            </p>
            <table className={styles.table}>
              <caption>
                {words(
                  locale,
                  "The two public CSVs, joined by cohort; rates are fractions of MRR.",
                  "按群组合并两份公开 CSV；比率为 MRR 的小数比例。",
                )}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{words(locale, "Cohort", "群组")}</th>
                  <th scope="col">MRR (USD)</th>
                  <th scope="col">{words(locale, "Churn", "流失率")}</th>
                  <th scope="col">{words(locale, "Expansion", "扩张率")}</th>
                </tr>
              </thead>
              <tbody>
                {data.cohorts.map((cohort) => (
                  <tr key={cohort.id}>
                    <th scope="row">
                      {cohort.id}
                      <span>{cohort.name}</span>
                    </th>
                    <td>{number(cohort.mrr)}</td>
                    <td>{cohort.churn}</td>
                    <td>{cohort.expansion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {view === "rules" && (
          <>
            <h3>
              {words(
                locale,
                "Numbers are only one part of the review",
                "数字正确只是评审的一部分",
              )}
            </h3>
            <div className={styles.ruleGrid}>
              <div>
                <span className={styles.eyebrow}>
                  {words(locale, "Hard constraints", "硬约束")}
                </span>
                <p>
                  {words(
                    locale,
                    "Use only the supplied figures; account for churn before expansion; state rate impacts in percentage points (pp); identify exactly two churn drivers. In this example, a violation caps the total score at 30%.",
                    "仅使用给定数据；先列流失再列扩张；比率影响用百分点（pp）表达；准确列出两个流失驱动群组。本例违反任一硬约束时，总分上限为 30%。",
                  )}
                </p>
              </div>
              <div>
                <span className={styles.eyebrow}>
                  {words(locale, "Quality dimensions", "质量维度")}
                </span>
                <p>
                  {words(
                    locale,
                    "Traceable bridge: 40. Churn exposure ranking: 35. Consistent expansion timing: 25. Each dimension has 0 / 0.5 / 1 anchors; optional behaviors have a combined effect of at most 5%.",
                    "收入计算可追溯：40；按流失金额排序：35；扩张基数假设一致：25。各维度有 0 / 0.5 / 1 判定锚点；可选行为的合计影响不超过 5%。",
                  )}
                </p>
              </div>
            </div>
            <p className={styles.callout}>
              {words(
                locale,
                "T1 accepts MRR within ±2% of the reference. T2 accepts churn impact within ±0.5 pp of 5.97 pp. The interactive check only evaluates these numeric bands; it does not assign a full rubric score.",
                "T1 接受参考 MRR 的 ±2% 相对误差；T2 接受相对 5.97 pp 的 ±0.5 pp 偏差。交互部分只检查数值容差，不代替完整 rubric 评分。",
              )}
            </p>
          </>
        )}
        {view === "answer" && (
          <>
            <h3>
              {words(
                locale,
                "Every term comes from the input rows",
                "每一项都能回到输入数据",
              )}
            </h3>
            <dl className={styles.bridge}>
              <div>
                <dt>{words(locale, "Starting MRR", "期初 MRR")}</dt>
                <dd>${number(base)}</dd>
              </div>
              <div>
                <dt>{words(locale, "Churn", "流失金额")}</dt>
                <dd>− ${number(churn)}</dd>
              </div>
              <div>
                <dt>{words(locale, "Expansion", "扩张金额")}</dt>
                <dd>+ ${number(expansion)}</dd>
              </div>
              <div className={styles.bridgeTotal}>
                <dt>{words(locale, "Next-quarter MRR", "下一季度 MRR")}</dt>
                <dd data-testid="playbook-reference-mrr">
                  ${number(expected)}
                </dd>
              </div>
            </dl>
            <p>
              {words(
                locale,
                "Assumption: expansion is booked on the beginning-of-period MRR, rather than the remaining post-churn base.",
                "假设：扩张按期初 MRR 计入，而非按扣除流失后的余额计入。",
              )}
            </p>
            <p>
              {words(locale, "Largest churn drivers:", "流失金额最大的群组：")}{" "}
              <strong>
                {drivers
                  .map(
                    (cohort) =>
                      `${cohort.id} ${cohort.name} ($${number(cohort.mrr * cohort.churn)})`,
                  )
                  .join(" · ")}
              </strong>
            </p>
            <p className={styles.callout}>
              {words(
                locale,
                `Total churn is ${churnPoints} pp of starting MRR. Using the post-churn base for expansion gives $${number(sensitivity)}; the top two churn drivers stay the same.`,
                `总流失金额占期初 MRR 的 ${churnPoints} pp。若扩张改用流失后的基数，MRR 为 $${number(sensitivity)}；最大的两个流失驱动群组不变。`,
              )}
            </p>
          </>
        )}
        {view === "judging" && (
          <>
            <h3>
              {words(
                locale,
                "Change the answer. Inspect the tolerance.",
                "修改答案，检查容差。",
              )}
            </h3>
            <p>
              {words(
                locale,
                "Try either answer from answers_demo.jsonl, or enter your own number. The calculation runs locally in this page.",
                "可以使用 answers_demo.jsonl 中的两个答案，或输入自己的数字。计算在当前页面本地完成。",
              )}
            </p>
            <div className={styles.checkLayout}>
              <div>
                <label className={styles.inputLabel} htmlFor={inputId}>
                  {words(
                    locale,
                    "Proposed next-quarter MRR (USD)",
                    "待检查的下一季度 MRR（USD）",
                  )}
                </label>
                <input
                  id={inputId}
                  className={styles.numberInput}
                  data-testid="playbook-mrr-input"
                  type="number"
                  min="0"
                  step="1"
                  inputMode="decimal"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                />
                <div className={styles.presets}>
                  {data.demoAnswers.map((value, index) => (
                    <button
                      key={value}
                      type="button"
                      data-testid={`playbook-answer-${index === 0 ? "pass" : "fail"}`}
                      onClick={() => setAnswer(String(value))}
                    >
                      ${number(value)}
                    </button>
                  ))}
                </div>
              </div>
              <div
                className={`${styles.result} ${passes ? styles.pass : styles.fail}`}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                data-testid="playbook-mrr-result"
                data-result={!valid ? "invalid" : passes ? "pass" : "fail"}
              >
                <span className={styles.eyebrow}>T1 · ±2%</span>
                <strong>
                  {!valid
                    ? words(locale, "Enter a valid number", "请输入有效数字")
                    : passes
                      ? words(locale, "Within tolerance", "在容差范围内")
                      : words(locale, "Outside tolerance", "超出容差范围")}
                </strong>
                {valid && (
                  <p>
                    {words(
                      locale,
                      `Absolute difference: $${number(difference, 2)} (${number((difference / expected) * 100, 3)}%).`,
                      `绝对差额：$${number(difference, 2)}（${number((difference / expected) * 100, 3)}%）。`,
                    )}
                  </p>
                )}
                <p>
                  {words(locale, "Accepted range", "允许区间")}
                  <br />${number(expected - allowedDifference)} – $
                  {number(expected + allowedDifference)}
                </p>
              </div>
            </div>
            <p className={styles.callout}>
              {words(
                locale,
                `T2 example: ${data.churnDemoAnswer} pp vs ${churnPoints} pp differs by ${number(Math.abs(data.churnDemoAnswer - churnPoints), 2)} pp, within the ±${data.pointsTolerance} pp band. Passing these numeric checks still leaves the method, units, drivers, and assumptions to review.`,
                `T2 示例：${data.churnDemoAnswer} pp 与 ${churnPoints} pp 相差 ${number(Math.abs(data.churnDemoAnswer - churnPoints), 2)} pp，在 ±${data.pointsTolerance} pp 内。数值通过后，仍须评审方法、单位、流失驱动群组与假设。`,
              )}
            </p>
          </>
        )}
      </div>
    </ExampleFrame>
  );
}

const aiwScenarios = [
  { id: "success", label: { en: "Worker completes", zh: "执行完成" } },
  { id: "capability", label: { en: "Capability mismatch", zh: "能力不符" } },
  { id: "timeout", label: { en: "Deadline reached", zh: "达到时限" } },
];

function AiwExample({ locale }: { locale: Locale }) {
  const [scenario, setScenario] = useState("success");
  const denied = scenario === "capability";
  const timeout = scenario === "timeout";
  const stages = [
    {
      label: words(locale, "Explicit selection", "显式选择"),
      status: denied ? "CAPABILITY_DENIED" : "workspace.read",
      text: denied
        ? words(
            locale,
            "An explicitly selected stateless worker lacks workspace.read. Reject the request before starting a process; a configured capability cannot expand its adapter’s reviewed limits.",
            "显式选择的无状态 worker 不具备 workspace.read。在创建进程前拒绝；配置不能突破适配器已经过审查的能力上限。",
          )
        : words(
            locale,
            "A named repo-review route requires workspace.read. Filter candidates by capability, preserve the declared profile order, then select an eligible worker.",
            "明确的 repo-review 路由要求 workspace.read。先按能力筛选，保留 profile 中声明的顺序，再选出合格 worker。",
          ),
    },
    {
      label: words(locale, "Transport & execution", "传递与执行"),
      status: denied
        ? words(locale, "Not started", "未启动")
        : timeout
          ? "TIMEOUT · 124"
          : words(locale, "Worker exit · 0", "子进程退出 · 0"),
      text: denied
        ? words(
            locale,
            "No prompt is sent to a model and no second worker is silently selected.",
            "不向模型发送任务，也不静默改选另一个 worker。",
          )
        : timeout
          ? words(
              locale,
              "The synthetic worker consumes the entire shared 30-second deadline. The dispatcher reports a timeout, rather than accepting a partial answer as success.",
              "合成场景中的 worker 用尽统一的 30 秒时限。调度器报告超时，不将部分回答视为执行成功。",
            )
          : words(
              locale,
              "A bounded work order travels through the reviewed adapter. The synthetic worker returns output with exit code 0; this establishes transport success only.",
              "有边界的任务经审查过的适配器传递。合成 worker 返回输出和退出码 0；这只表示传递与执行完成。",
            ),
    },
    {
      label: words(locale, "Containment & cleanup", "进程收尾与清理"),
      status: denied
        ? words(locale, "Nothing launched", "无进程待收尾")
        : words(locale, "Confirmed in this scenario", "本场景设为已确认"),
      text: denied
        ? words(
            locale,
            "Preflight stops before execution. No worker process tree or prompt artifact needs runtime cleanup.",
            "执行前检查已停止流程，不产生需要运行期清理的 worker 进程树或任务临时文件。",
          )
        : timeout
          ? words(
              locale,
              "This scenario assumes process-tree termination and temporary-file cleanup succeed. The total budget is exhausted, so no fallback attempt starts.",
              "本场景假设进程树终止和临时文件清理成功。总预算已耗尽，不会开始下一次尝试。",
            )
          : words(
              locale,
              "Even after successful root completion, the runner closes the contained process tree and cleans owned temporary artifacts. Cleanup remains a separate result to inspect.",
              "即使主进程成功结束，执行器仍会关闭其管理的进程树并清理自有临时文件。清理状态需要独立核查。",
            ),
    },
    {
      label: words(locale, "Acceptance", "任务验收"),
      status:
        denied || timeout
          ? words(locale, "No accepted result", "没有可验收结果")
          : words(locale, "Review required", "仍需审阅"),
      text:
        denied || timeout
          ? words(
              locale,
              "Resolve the capability or runtime issue before requesting another bounded run. No completed work is claimed here.",
              "先解决能力或运行时问题，再发起另一次有边界的任务。这里不宣称工作已经完成。",
            )
          : words(
              locale,
              "A human or orchestrator must still inspect the output, files, diff, and task-specific checks. The worker cannot grant its own acceptance.",
              "人或主代理仍须检查输出、文件、差异及任务验收项。worker 不能自行宣布最终验收通过。",
            ),
    },
  ];
  return (
    <ExampleFrame
      slug="ai-cli-orchestrator"
      locale={locale}
      title={words(
        locale,
        "Follow the boundary, not just the happy path",
        "沿着任务边界，查看三个执行分支",
      )}
      note={words(
        locale,
        "Synthetic flow demonstration based on the public v0.3 contract and deterministic tests. These are illustrative states, not production logs or live CLI calls.",
        "根据公开 v0.3 约定和确定性测试制作的合成流程演示。这些是说明性状态，不是生产日志或实时 CLI 调用。",
      )}
      source={examples.aiw.source}
    >
      <Choices
        id="aiw-scenario"
        label={words(locale, "Choose an execution scenario", "选择执行场景")}
        options={aiwScenarios}
        value={scenario}
        onChange={setScenario}
        locale={locale}
      />
      <ol
        className={styles.flow}
        data-testid="aiw-flow"
        data-scenario={scenario}
      >
        {stages.map((stage, index) => (
          <li key={stage.label}>
            <span className={styles.flowNumber} aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <p className={styles.eyebrow}>{stage.label}</p>
              <h3 data-testid={`aiw-stage-${index + 1}`}>{stage.status}</h3>
              <p>{stage.text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className={styles.boundary}>
        {words(
          locale,
          "Real cleanup failure is reported separately and cannot trigger fallback. Timeout fallback is read-only, opt-in, and requires confirmed termination plus remaining budget. A started write worker is never automatically replaced.",
          "真实清理失败会单独报告，不能触发回退。超时回退仅适用于显式启用的只读任务，且要求已确认终止并有剩余预算。写入 worker 一旦启动，就不会自动换另一个执行。",
        )}{" "}
        <a href={examples.aiw.tests} target="_blank" rel="noreferrer">
          {words(locale, "Read the tests", "查看测试")} ↗
        </a>
      </p>
    </ExampleFrame>
  );
}

function AutoResearchTraceExample({ locale }: { locale: Locale }) {
  const [stepId, setStepId] = useState("trial-01");
  const data = examples.autoresearch;
  const trials = archivedAutoResearchState.trials;
  const step =
    trials.find((item) => `trial-${String(item.trial).padStart(2, "0")}` === stepId) ??
    trials[0];
  return (
    <ExampleFrame
      slug="autoresearch-evidence-pack"
      locale={locale}
      title={words(locale, "One-minute archived trace review", "一分钟审阅：已归档轨迹")}
      note={words(
        locale,
        "Read-only playback of the archived fresh-dev-agent-01 record at Research Agent Bench r2 (e23760f). It makes no LLM call and does not recompute NFCorpus.",
        "按 Research Agent Bench r2（e23760f）中 fresh-dev-agent-01 的归档记录只读播放；不调用 LLM，也不重算 NFCorpus。",
      )}
      source={data.stateSource}
      sourceLabel={words(locale, "Open archived state.json", "打开归档 state.json")}
    >
      <Choices
        id="autoresearch-trace-step"
        label={words(locale, "Choose an archived development call", "选择一条归档开发调用")}
        options={trials.map((trial) => ({
          id: `trial-${String(trial.trial).padStart(2, "0")}`,
          label: {
            en: `${String(trial.trial).padStart(2, "0")} · Archived call`,
            zh: `${String(trial.trial).padStart(2, "0")} · 归档调用`,
          },
        }))}
        value={stepId}
        onChange={setStepId}
        locale={locale}
      />
      <div
        className={styles.panel}
        data-testid="autoresearch-trace-content"
        data-step={`trial-${String(step.trial).padStart(2, "0")}`}
      >
        <p className={styles.eyebrow}>
          {words(locale, `Archived call ${step.trial} of 6`, `归档调用 ${step.trial} / 6`)}
        </p>
        <h3>
          k={step.candidate.k} · BM25 weight={step.candidate.bm25_weight} · dev nDCG@10{" "}
          {step.metrics["ndcg@10"].toFixed(6)}
        </h3>
        {locale === "zh" ? (
          <p>{step.hypothesis}</p>
        ) : (
          <p>
            <strong>English translation (not archived text): </strong>
            {data.englishHypothesisTranslations[step.trial - 1]}
          </p>
        )}
        <p className={styles.callout}>
          {words(
            locale,
            `Recorded status: ${step.status}; exit code ${step.exit_code}; wall time ${step.wall_seconds.toFixed(3)}s. Wall time and nDCG are rounded for display; the exact archived values are in the pinned JSON.`,
            `记录状态：${step.status}；退出码 ${step.exit_code}；耗时 ${step.wall_seconds.toFixed(3)} 秒。耗时和 nDCG 为四舍五入的显示值，精确归档值见固定 JSON。`,
          )}
        </p>
      </div>
      <div className={styles.traceSummary} data-testid="autoresearch-trace-summary">
        <div>
          <p className={styles.eyebrow}>{words(locale, "Frozen selection", "冻结选择")}</p>
          <strong>k=100 · BM25 weight=0.5</strong>
          <p>{words(locale, "All three fresh trajectories selected this same configuration; it produces one unique ranking.", "三条新增轨迹均选择该配置，只形成一组唯一排名。")}</p>
        </div>
        <div>
          <p className={styles.eyebrow}>{words(locale, "Public test comparison", "公开测试对照")}</p>
          <strong>
            {data.publicTestNdcg.slice(0, 8)} &lt; {data.presetSearchNdcg}
          </strong>
          <p>{words(locale, "Agent selection is below the pre-specified six-point search.", "代理选择低于预设六点搜索。")}</p>
        </div>
      </div>
      <p className={styles.boundary}>
        {words(
          locale,
          `Selection lock SHA-256: ${data.selectionLockSha256}. Archived state SHA-256: ${data.stateSha256}. The public test is exploratory: there is no independently verifiable model, provider, or session provenance, and AI-assisted execution does not establish the applicant’s own ability.`,
          `selection_lock SHA-256：${data.selectionLockSha256}。归档 state SHA-256：${data.stateSha256}。公开测试属探索性结果：没有可独立核验的模型、提供商或会话来源凭证，AI 辅助执行也不构成申请人本人能力证明。`,
        )}{" "}
        <a href={data.lockSource} target="_blank" rel="noreferrer">
          {words(locale, "Inspect selection lock", "查看选择锁")} ↗
        </a>{" · "}
        <a href={data.reportSource} target="_blank" rel="noreferrer">
          {words(locale, "Read report", "查看报告")} ↗
        </a>{" · "}
        <a href={data.replaySource} target="_blank" rel="noreferrer">
          {words(locale, "Inspect source replay", "查看源码复跑")} ↗
        </a>{" · "}
        <a href={data.bundleSource} target="_blank" rel="noreferrer">
          {words(locale, "Download fixed review bundle", "下载固定审阅包")} ↗
        </a>
      </p>
    </ExampleFrame>
  );
}

export function PortfolioExample({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  if (slug === "launchlens-ai") return <LaunchLensExample locale={locale} />;
  if (slug === "llm-evaluation-playbook")
    return <PlaybookExample locale={locale} />;
  if (slug === "ai-cli-orchestrator") return <AiwExample locale={locale} />;
  if (slug === "autoresearch-evidence-pack")
    return <AutoResearchTraceExample locale={locale} />;
  return null;
}
