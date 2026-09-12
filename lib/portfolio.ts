import type { Metadata } from "next";
import data from "@/data/portfolio.json";

export type Locale = "en" | "zh";
export type Localized = Record<Locale, string>;
export interface ProjectCopy {
  eyebrow: string;
  summary: string;
  problem: string;
  role: string[];
  decisions: {
    title: string;
    choice: string;
    tradeoff: string;
    verification: string;
  }[];
  outcome: string;
  limits: string[];
}
export interface PortfolioProject {
  slug: string;
  name: string;
  tier: "flagship" | "selected" | "archive";
  kind: "product" | "tool" | "study" | "private";
  repoUrl: string | null;
  demoUrl: string | null;
  verifiedAt: string;
  tags: string[];
  related: string[];
  content: Record<Locale, ProjectCopy>;
  evidence: {
    label: Localized;
    url: string;
    type: "source" | "release" | "report" | "demo";
  }[];
}
export const portfolio = data.projects as PortfolioProject[];
export const updatedAt = data.updatedAt;
export const siteUrl = "https://www.panzhichao.com";
export const githubUrl = "https://github.com/Zhi-Chao-PAN";
export const contactEmail = "18652585856@163.com";
export const stats = {
  cases: portfolio.length,
  publicRepositories: portfolio.filter((p) => p.repoUrl).length,
  demoLinks: portfolio.filter((p) => p.demoUrl).length,
};
export function pagePath(locale: Locale, slug?: string) {
  if (slug) return `${locale === "zh" ? "/zh" : ""}/projects/${slug}`;
  return locale === "zh" ? "/zh" : "/";
}
export function projectBySlug(slug: string) {
  return portfolio.find((p) => p.slug === slug);
}
export function pageMetadata(
  locale: Locale,
  project?: PortfolioProject,
): Metadata {
  const title = project
    ? `${project.name} — ZhiChao Pan`
    : locale === "en"
      ? "ZhiChao Pan — Applied AI, built with judgment"
      : "潘志超 — 应用 AI、评测与产品交付";
  const description = project
    ? project.content[locale].summary
    : locale === "en"
      ? "Product-led, AI-assisted engineering. Selected work in AI products, evaluation design, and bounded agent tooling by ZhiChao Pan."
      : "潘志超的个人作品集：主导需求与技术取舍，组织 AI 辅助实现，通过评测和检查持续交付。";
  const path = pagePath(locale, project?.slug);
  const image = `${siteUrl}/og/${project?.slug ?? "home"}-${locale}.png`;
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: path,
      languages: {
        en: pagePath("en", project?.slug),
        "zh-CN": pagePath("zh", project?.slug),
        "x-default": pagePath("en", project?.slug),
      },
    },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "ZhiChao Pan",
      locale: locale === "en" ? "en_US" : "zh_CN",
      alternateLocale: locale === "en" ? "zh_CN" : "en_US",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
export const ui = {
  en: {
    work: "Selected work",
    index: "All projects",
    about: "About",
    contact: "Get in touch",
    case: "Explore the case",
    source: "Source",
    demo: "Open product",
    back: "Back to all projects",
    problem: "The problem",
    role: "My contribution",
    decisions: "Decisions & tradeoffs",
    sample: "See the work",
    outcome: "What the work shows",
    evidence: "Follow the evidence",
    limits: "What this does not establish",
    related: "Related work",
    choice: "The choice",
    tradeoff: "The tradeoff",
    verification: "How it is checked",
    tools: "Tools & methods",
    verified: "Sources reviewed",
    private: "Private project · public overview",
    skip: "Skip to content",
  },
  zh: {
    work: "精选作品",
    index: "全部项目",
    about: "关于我",
    contact: "联系我",
    case: "阅读案例",
    source: "源码",
    demo: "打开产品",
    back: "返回全部项目",
    problem: "实际问题",
    role: "我的贡献",
    decisions: "关键选择与取舍",
    sample: "查看成果样例",
    outcome: "这项工作说明了什么",
    evidence: "查看原始依据",
    limits: "当前边界",
    related: "相关项目",
    choice: "选择",
    tradeoff: "代价与取舍",
    verification: "如何检查",
    tools: "工具与方法",
    verified: "来源核对日期",
    private: "私有项目 · 公开简述",
    skip: "跳转到正文",
  },
};
