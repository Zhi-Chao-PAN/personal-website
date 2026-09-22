import Link from "next/link";
import { PortfolioHeader, PortfolioFooter } from "./portfolio-shell";
import { PortfolioFeatured } from "./portfolio-featured";
import {
  portfolio,
  stats,
  updatedAt,
  pagePath,
  githubUrl,
  type Locale,
} from "@/lib/portfolio";

export function PortfolioHome({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  const flagship = portfolio.filter((p) => p.tier === "flagship");
  const other = portfolio.filter((p) => p.tier !== "flagship");
  return (
    <div id="top">
      <PortfolioHeader locale={locale} />
      <main id="main">
        <section className="hero wrap" aria-labelledby="hero-title">
          <div className="hero-intro">
            <span className="eyebrow">
              <i className="live-dot" aria-hidden="true" />
              {zh
                ? "应用 AI · 评测 · 产品交付"
                : "APPLIED AI · EVALUATION · PRODUCT DELIVERY"}
            </span>
            <span className="hero-location">
              {zh
                ? "中国，扬州 / 面向更广阔的问题"
                : "YANGZHOU, CN / LOOKING OUTWARD"}
            </span>
          </div>
          <h1 id="hero-title" className="hero-name">
            ZhiChao
            <span>
              Pan<span className="brand-dot">.</span>
            </span>
          </h1>
          <div className="hero-bottom">
            <div className="hero-statement">
              <h2>
                {zh ? (
                  <>
                    把想法做成产品，
                    <br />
                    <span>把判断落到证据。</span>
                  </>
                ) : (
                  <>
                    Useful AI products.
                    <br />
                    <span>Judgment you can follow.</span>
                  </>
                )}
              </h2>
              <p>
                {zh
                  ? "我是潘志超。我主导需求与方案取舍，组织 AI 辅助实现，再通过评测、检查和迭代把工作落到实处。"
                  : "I’m ZhiChao. I lead product decisions, organize AI-assisted implementation, and use evaluation and review to turn ideas into work people can inspect."}
              </p>
              <div className="hero-actions">
                <a className="button button-primary" href="#work">
                  {zh ? "看代表作" : "Explore selected work"}{" "}
                  <span aria-hidden="true">↘</span>
                </a>
                <a className="button button-quiet" href={githubUrl}>
                  GitHub ↗
                </a>
              </div>
            </div>
            <div className="hero-aside">
              <span className="eyebrow">{zh ? "目前" : "CURRENTLY"}</span>
              <p>
                {zh
                  ? "计算机专业在读\n准备 AI / 计算机硕士申请\n欢迎工程与产品机会"
                  : "Computer Science student\nPreparing for AI / computing graduate study\nOpen to engineering & product opportunities"}
              </p>
              <span className="hero-edition">PORTFOLIO / 2026.09</span>
            </div>
          </div>
        </section>
        <section
          className="section wrap"
          id="work"
          aria-labelledby="work-title"
        >
          <div className="section-meta">
            <span className="eyebrow">
              01 / {zh ? "精选作品" : "SELECTED WORK"}
            </span>
            <span className="small-note">2026</span>
          </div>
          <div className="section-heading">
            <h2 id="work-title">
              {zh ? (
                <>
                  做出产品。定义质量。
                  <br />
                  <span>约束执行。</span>
                </>
              ) : (
                <>
                  Build it. Evaluate it.
                  <br />
                  <span>Give it boundaries.</span>
                </>
              )}
            </h2>
            <p>
              {zh
                ? "三个互补的项目，展示我如何组织工作、做出取舍，并留下可检查的结果。"
                : "Three complementary projects, with the decisions, working examples, and evidence behind them."}
            </p>
          </div>
          <PortfolioFeatured
            items={flagship.map((p) => ({
              slug: p.slug,
              name: p.name,
              eyebrow: p.content[locale].eyebrow,
              summary: p.content[locale].summary,
            }))}
            locale={locale}
          />
        </section>
        <section
          className="section wrap"
          id="projects"
          aria-labelledby="projects-title"
        >
          <div className="section-meta">
            <span className="eyebrow">
              02 / {zh ? "继续探索" : "FURTHER EXPLORATIONS"}
            </span>
            <span className="small-note">
              {stats.cases} {zh ? "篇案例" : "cases"} ·{" "}
              {stats.publicRepositories}{" "}
              {zh ? "个公开项目仓库" : "public project repositories"}
            </span>
          </div>
          <div className="section-heading">
            <h2 id="projects-title">
              {zh ? (
                "同一种好奇，\n不同的问题。"
              ) : (
                <>
                  The same curiosity.
                  <br />
                  <span>Different problems.</span>
                </>
              )}
            </h2>
            <p>
              {zh
                ? "评测工作台、金融文档、可靠性研究，以及更早的产品实践。"
                : "Evaluation workspaces, financial documents, reliability studies, and earlier product explorations."}
            </p>
          </div>
          <div className="project-index">
            {other.map((p, i) => (
              <Link
                key={p.slug}
                href={pagePath(locale, p.slug)}
                className={`index-row ${p.tier === "selected" ? "index-selected" : ""}`}
              >
                <span className="index-number">
                  {String(i + 4).padStart(2, "0")}
                </span>
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.content[locale].summary}</p>
                </div>
                <span className="index-type">
                  {p.content[locale].eyebrow}
                  <small>
                    {p.repoUrl
                      ? zh
                        ? "公开源码"
                        : "Public source"
                      : p.kind === "private"
                        ? zh
                          ? "私有项目简述"
                          : "Private project overview"
                      : zh
                        ? "公开证据附件"
                        : "Public evidence package"}
                  </small>
                </span>
                <span className="index-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            ))}
          </div>
          <p className="index-footnote">
            {zh
              ? `${stats.demoLinks} 个演示入口可访问；案例会分别说明示例数据、真实功能和验证范围。`
              : `${stats.demoLinks} accessible demo entry points. Each case distinguishes example data, product functionality, and the scope of validation.`}
          </p>
        </section>
        <section
          className="section about-section wrap"
          id="about"
          aria-labelledby="about-title"
        >
          <div className="section-meta">
            <span className="eyebrow">
              03 / {zh ? "背景与进展" : "ABOUT & CURRENT"}
            </span>
            <span className="small-note">
              {zh ? "更新于" : "UPDATED"} {updatedAt}
            </span>
          </div>
          <div className="about-grid">
            <div>
              <h2 id="about-title">
                {zh ? (
                  <>
                    好奇心驱动。
                    <br />
                    <span>判断力落地。</span>
                  </>
                ) : (
                  <>
                    Curiosity first.
                    <br />
                    <span>Follow-through always.</span>
                  </>
                )}
              </h2>
              <p className="about-lead">
                {zh
                  ? "扬州大学广陵学院计算机科学与技术专业在读，正在准备海外 AI / 计算机相关硕士申请，同时寻找能继续学习和交付的工程、产品机会。"
                  : "I study Computer Science at Guangling College, Yangzhou University. I’m preparing for overseas graduate study in AI and computing, while exploring opportunities to contribute to engineering and product work."}
              </p>
              <p>
                {zh
                  ? "我的工作方式是先弄清楚问题，再组织工具实现。我会借助 AI 写代码，也会追问方案为何成立、结果如何复查、下一轮应该改什么。具体职责和限制都放在案例里。"
                  : "My work starts with clarifying the problem and organizing the tools to address it. I use AI in implementation, then question the choices, inspect the results, and guide the next iteration. Each case makes my role and the limits explicit."}
              </p>
            </div>
            <div className="current-notes">
              <h3>{zh ? "最近公开的工作" : "Recently made public"}</h3>
              <a href="https://github.com/Zhi-Chao-PAN/llm-evaluation-playbook/releases/tag/v0.2.0">
                <time dateTime="2026-09-11">2026.09</time>
                <div>
                  <strong>LLM Evaluation Playbook</strong>
                  <p>
                    {zh
                      ? "把评测实践整理为公开方法、合成样例和自动检查工具。"
                      : "Evaluation practice, published as methods, synthetic examples, and automated checks."}
                  </p>
                </div>
                <span aria-hidden="true">↗</span>
              </a>
              <a href="https://github.com/Zhi-Chao-PAN/ai-cli-orchestrator/releases/tag/v0.3.0">
                <time dateTime="2026-07-31">2026.07</time>
                <div>
                  <strong>AI CLI Orchestrator</strong>
                  <p>
                    {zh
                      ? "为本地 AI CLI 提供显式路由、执行边界和结果记录。"
                      : "Explicit routing, execution boundaries, and result records for local AI CLIs."}
                  </p>
                </div>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>
        </section>
      </main>
      <PortfolioFooter locale={locale} />
    </div>
  );
}
