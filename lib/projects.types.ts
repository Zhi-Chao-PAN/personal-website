/**
 * Project metadata type — used by ProjectCard, ProjectModal, and the
 * projects-section components. Source: data/projects.generated.json (built by
 * scripts/fetch-projects.mjs).
 */
export type ProjectLanguage = 'TypeScript' | 'Python' | 'JavaScript' | 'Other';

export interface ProjectLanguageEntry {
  name: ProjectLanguage | string;
  bytes: number;
  /** Hex color from the GitHub language palette. */
  color: string;
  /** 0-100, rounded. */
  percent: number;
}

export interface ProjectHeadline {
  /** Short uppercase label, e.g. "RELEASE" / "ACCURACY LIFT". */
  label: string;
  /** Big mono value, e.g. "v1.0.0" / "+37.5%". */
  value: string;
}

export interface ProjectStackEntry {
  /** Display name, e.g. "Next.js 16". */
  name: string;
  /** Source: 'package.json' | 'pyproject' | 'manual'. */
  source: string;
}

export interface Project {
  /** URL-safe identifier (matches GitHub repo name). */
  slug: string;
  /** Human-readable display name. */
  name: string;
  /** Long-form description from GitHub (or fallback). */
  description: string;
  /** Truncated, single-sentence tagline for cards. */
  tagline: string;

  // ----- Language & size -----
  /** Primary language (normalized). */
  language: ProjectLanguage;
  /** Hex color associated with the language (GitHub palette). */
  languageColor: string;
  /** Full language breakdown (sorted by bytes desc). */
  languages: ProjectLanguageEntry[];

  // ----- Engagement -----
  /** Star count (0 hides the badge). */
  stars: number;
  /** Commit count from /repos/.../commits?per_page=1 (approximate, 0 = unknown). */
  commits: number;
  /** Up to 4 GitHub topics, lowercased. */
  topics: string[];

  // ----- Timeline -----
  /** ISO timestamp of creation. */
  createdAt: string;
  /** ISO timestamp of last push. */
  pushedAt: string;
  /** Age in whole days since creation. */
  ageInDays: number;
  /** Human relative time of last push, e.g. "2d ago" / "3mo ago". */
  pushedRelative: string;

  // ----- Repo size & meta -----
  /** Repo size in bytes. */
  size: number;
  /** Human-readable size, e.g. "46.9 MB". */
  sizeHuman: string;
  /** License SPDX id, e.g. "MIT" (null if no license). */
  license: string | null;
  /** Default branch name. */
  defaultBranch: string;

  // ----- Stack (from package.json / pyproject) -----
  /** Detected stack entries (top 3 dependencies). */
  stack: ProjectStackEntry[];

  // ----- Hand-curated content -----
  /** Per-project headline metric (only on 4 of 7). */
  headline: ProjectHeadline | null;
  /** Cross-reference slugs to related projects. */
  references: string[];

  // ----- URLs -----
  /** GitHub repo URL. */
  githubUrl: string;
  /** Live demo URL (null when no deployment exists). */
  demoUrl: string | null;
  /** Whether this project has a live demo. */
  featured: boolean;
}
