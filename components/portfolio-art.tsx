import Image from "next/image";
import type { Locale } from "@/lib/portfolio";

export function PortfolioArt({
  slug,
  locale,
}: {
  slug: string;
  locale: Locale;
}) {
  const zh = locale === "zh";
  if (slug === "launchlens-ai")
    return (
      <div className="work-art product-art">
        <div className="art-topline">
          <span>LAUNCHLENS / WORKSPACE</span>
          <span>{zh ? "公开产品截图" : "PUBLIC PRODUCT SCREENSHOT"}</span>
        </div>
        <div className="product-image">
          <Image
            unoptimized
            src="/images/launchlens.webp"
            alt={
              zh
                ? "LaunchLens 产品工作台的真实界面"
                : "Actual LaunchLens product workspace interface"
            }
            width={1200}
            height={750}
            sizes="(max-width: 760px) 90vw, 50vw"
          />
        </div>
        <div className="art-caption">
          {zh
            ? "从假设出发，让证据进入决策。"
            : "An idea becomes a decision you can inspect."}
        </div>
      </div>
    );
  if (slug === "llm-evaluation-playbook")
    return (
      <div className="work-art evaluation-art">
        <div className="art-topline">
          <span>EVALUATION / METHOD</span>
          <span>{zh ? "方法示意" : "METHOD OVERVIEW"}</span>
        </div>
        <div className="evaluation-sheet">
          <span className="eyebrow">
            01 / {zh ? "定义可判定的任务" : "MAKE THE TASK JUDGEABLE"}
          </span>
          <h3>
            {zh ? (
              "一个结论。\n一条可查的依据。"
            ) : (
              <>
                One claim.
                <br />A traceable reason.
              </>
            )}
          </h3>
          <div className="rubric-line">
            <span>01</span>
            {zh ? "明确输入与交付物" : "Define the input and deliverable"}
            <b>↗</b>
          </div>
          <div className="rubric-line">
            <span>02</span>
            {zh ? "设定规则与数值容差" : "Specify rules and tolerances"}
            <b>↗</b>
          </div>
          <div className="rubric-line">
            <span>03</span>
            {zh
              ? "隔离参考答案，检查题包"
              : "Separate references. Check the package."}
            <b>↗</b>
          </div>
        </div>
        <div className="art-caption">
          {zh
            ? "任务规范 → 评分规则 → 可运行的检查"
            : "Task specification → rubric → executable checks"}
        </div>
      </div>
    );
  return (
    <div className="work-art orchestration-art">
      <div className="art-topline">
        <span>AIW / EXECUTION</span>
        <span>{zh ? "流程示意" : "WORKFLOW OVERVIEW"}</span>
      </div>
      <div className="routing-figure">
        <span className="route-node route-input">
          {zh ? "明确任务与边界" : "A bounded work order"}
        </span>
        <span className="route-connector" aria-hidden="true">
          ↓
        </span>
        <div className="route-workers">
          <span>{zh ? "检查能力" : "Capability check"}</span>
          <span>{zh ? "显式选择" : "Explicit selection"}</span>
        </div>
        <span className="route-connector" aria-hidden="true">
          ↓
        </span>
        <span className="route-node route-output">
          {zh ? "执行 · 记录 · 清理" : "Execute · record · clean up"}
        </span>
        <span className="route-connector" aria-hidden="true">
          ↓
        </span>
        <span className="route-review">
          {zh ? "结果仍需审查与验收" : "Review the work, then accept it."}
        </span>
      </div>
      <div className="art-caption">
        {zh
          ? "可替换的工具，有边界的执行。"
          : "Replaceable tools. Deliberate boundaries."}
      </div>
    </div>
  );
}
