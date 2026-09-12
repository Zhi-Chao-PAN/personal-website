"use client";
import { useState } from "react";
import Link from "next/link";
import { PortfolioArt } from "./portfolio-art";
import type { Locale } from "@/lib/portfolio";
const pagePath = (locale: Locale, slug: string) =>
  `${locale === "zh" ? "/zh" : ""}/projects/${slug}`;

type Feature = { slug: string; name: string; eyebrow: string; summary: string };
export function PortfolioFeatured({
  items,
  locale,
}: {
  items: Feature[];
  locale: Locale;
}) {
  const [active, setActive] = useState(0);
  return (
    <div className="featured-work">
      <div className="feature-list">
        {items.map((item, i) => (
          <article
            key={item.slug}
            className={`feature-item ${active === i ? "is-active" : ""}`}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
          >
            <div className="feature-heading">
              <span className="feature-number">0{i + 1}</span>
              <span className="eyebrow">{item.eyebrow}</span>
              <button
                className="feature-preview"
                type="button"
                aria-label={`${locale === "en" ? "Preview" : "预览"} ${item.name}`}
                aria-pressed={active === i}
                onClick={() => setActive(i)}
              >
                ↗
              </button>
            </div>
            <h3>
              <Link href={pagePath(locale, item.slug)}>{item.name}</Link>
            </h3>
            <p>{item.summary}</p>
            <Link className="text-link" href={pagePath(locale, item.slug)}>
              {locale === "en" ? "Explore the case" : "阅读案例"}{" "}
              <span aria-hidden="true">↗</span>
            </Link>
            <div className="mobile-work-art">
              <PortfolioArt slug={item.slug} locale={locale} />
            </div>
          </article>
        ))}
      </div>
      <div
        className="feature-stage"
        aria-label={
          locale === "en" ? "Selected project preview" : "精选项目预览"
        }
      >
        {items.map((item, i) => (
          <div key={item.slug} className="feature-panel" hidden={active !== i}>
            <PortfolioArt slug={item.slug} locale={locale} />
            <Link className="stage-link" href={pagePath(locale, item.slug)}>
              {item.name}
              <span>{locale === "en" ? "Open case" : "查看案例"} ↗</span>
            </Link>
          </div>
        ))}
        <p className="stage-note">
          {locale === "en"
            ? "Three ways to make AI work worth inspecting."
            : "从产品、评测和执行三个方面，把工作做得有据可查。"}
        </p>
      </div>
    </div>
  );
}
