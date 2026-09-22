import Link from "next/link";
import { PortfolioHeader, PortfolioFooter } from "./portfolio-shell";
import { PortfolioArt } from "./portfolio-art";
import { PortfolioExample } from "./portfolio-examples";
import {
  pagePath,
  projectBySlug,
  ui,
  type PortfolioProject,
  type Locale,
} from "@/lib/portfolio";

export function PortfolioCase({
  project,
  locale,
}: {
  project: PortfolioProject;
  locale: Locale;
}) {
  const copy = project.content[locale],
    t = ui[locale],
    zh = locale === "zh";
  const flagship = project.tier === "flagship";
  const related = project.related
    .map(projectBySlug)
    .filter((p): p is PortfolioProject => Boolean(p));
  return (
    <div id="top">
      <PortfolioHeader locale={locale} slug={project.slug} />
      <main id="main" className="case-main wrap">
        <Link
          className="case-back"
          href={`${pagePath(locale)}#${flagship ? "work" : "projects"}`}
        >
          ← {t.back}
        </Link>
        <header className="case-hero">
          <div className="section-meta">
            <span className="eyebrow">{copy.eyebrow}</span>
            <span className="small-note">
              {project.repoUrl
                ? zh
                  ? "公开项目案例"
                  : "PUBLIC PROJECT CASE"
                : project.kind === "private"
                  ? t.private
                  : zh
                    ? "公开研究证据"
                    : "PUBLIC RESEARCH EVIDENCE"}
            </span>
          </div>
          <h1>{project.name}</h1>
          <p className="case-summary">{copy.summary}</p>
          <div className="case-actions">
            {flagship && (
              <a className="button button-primary" href="#example">
                {t.sample} ↓
              </a>
            )}
            {project.repoUrl && (
              <a className="button button-secondary" href={project.repoUrl}>
                {t.source} ↗
              </a>
            )}
            {project.demoUrl && (
              <a className="button button-quiet" href={project.demoUrl}>
                {t.demo} ↗
              </a>
            )}
          </div>
          <p className="case-source-note">
            {t.verified}: {project.verifiedAt}
          </p>
        </header>
        {flagship && (
          <div className="case-cover">
            <PortfolioArt slug={project.slug} locale={locale} />
          </div>
        )}
        <div className="case-body">
          <aside className="case-nav">
            <span className="eyebrow">{zh ? "案例目录" : "IN THIS CASE"}</span>
            {[
              ["problem", t.problem],
              ["role", t.role],
              ["decisions", t.decisions],
              ...(flagship ? [["example", t.sample]] : []),
              ["evidence", t.evidence],
              ["limits", t.limits],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`}>
                {label}
              </a>
            ))}
            <span className="case-review-date">
              {t.verified}
              <br />
              {project.verifiedAt}
            </span>
          </aside>
          <article className="case-article">
            <section id="problem" className="case-section">
              <span className="eyebrow">
                01 / {zh ? "问题背景" : "CONTEXT"}
              </span>
              <h2>{t.problem}</h2>
              <p>{copy.problem}</p>
            </section>
            <section id="role" className="case-section">
              <span className="eyebrow">
                02 / {zh ? "职责与参与" : "OWNERSHIP"}
              </span>
              <h2>{t.role}</h2>
              <ul className="role-list">
                {copy.role.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
              <div className="role-note">
                {project.slug === "autoresearch-evidence-pack"
                  ? zh
                    ? "证据状态：AI 辅助执行；本人独立复跑与讲解待完成。"
                    : "Evidence status: AI-assisted execution; personal independent rerun and explanation remain pending."
                  : zh
                    ? "工作方式：产品主导，AI 辅助实现，逐步检查与迭代。"
                    : "Working approach: product-led, AI-assisted implementation, followed by review and iteration."}
              </div>
            </section>
            <section id="decisions" className="case-section">
              <span className="eyebrow">
                03 / {zh ? "方案判断" : "ENGINEERING JUDGMENT"}
              </span>
              <h2>{t.decisions}</h2>
              <div className="decision-list">
                {copy.decisions.map((d, i) => (
                  <div className="decision" key={d.title}>
                    <span className="decision-number">0{i + 1}</span>
                    <h3>{d.title}</h3>
                    <dl>
                      <dt>{t.choice}</dt>
                      <dd>{d.choice}</dd>
                      <dt>{t.tradeoff}</dt>
                      <dd>{d.tradeoff}</dd>
                      <dt>{t.verification}</dt>
                      <dd>{d.verification}</dd>
                    </dl>
                  </div>
                ))}
              </div>
            </section>
            {flagship && (
              <section id="example" className="case-section sample-section">
                <span className="eyebrow">
                  04 / {zh ? "深入了解" : "A CLOSER LOOK"}
                </span>
                <h2>{t.sample}</h2>
                <PortfolioExample slug={project.slug} locale={locale} />
              </section>
            )}
            <section className="case-section">
              <h2>{t.outcome}</h2>
              <p className="outcome-text">{copy.outcome}</p>
            </section>
            <section id="evidence" className="case-section">
              <span className="eyebrow">
                {zh ? "从结论回到来源" : "FROM CLAIM TO SOURCE"}
              </span>
              <h2>{t.evidence}</h2>
              {project.evidence.length ? (
                <ul className="evidence-list">
                  {project.evidence.map((e, i) => (
                    <li key={`${e.url}-${i}`}>
                      <a href={e.url}>
                        <span>
                          <small>{String(i + 1).padStart(2, "0")}</small>
                          {e.label[locale]}
                        </span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  {zh
                    ? "目前仅提供公开概念简述，没有公开源码或可复现实验材料。"
                    : "This is a public overview only; source code and reproducible experiment materials are not publicly available."}
                </p>
              )}
            </section>
            <section id="limits" className="case-section limits-section">
              <h2>{t.limits}</h2>
              <ul>
                {copy.limits.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </section>
            <section className="case-section">
              <h2>{t.tools}</h2>
              <div className="tag-list">
                {project.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </section>
          </article>
        </div>
        {related.length > 0 && (
          <section className="related-section">
            <h2>{t.related}</h2>
            <div>
              {related.map((p) => (
                <Link key={p.slug} href={pagePath(locale, p.slug)}>
                  {p.name} ↗
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <PortfolioFooter locale={locale} />
    </div>
  );
}
