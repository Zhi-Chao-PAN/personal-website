/**
 * Project metadata type — used by ProjectCard and projects-section components.
 * Source: data/projects.generated.json (built by scripts/fetch-projects.mjs).
 */
export type ProjectLanguage = 'TypeScript' | 'Python' | 'JavaScript' | 'Other';

export interface Project {
  /** URL-safe identifier (matches GitHub repo name). */
  slug: string;
  /** Human-readable display name. */
  name: string;
  /** Long-form description from GitHub (or fallback). */
  description: string;
  /** Truncated, single-sentence tagline for cards. */
  tagline: string;
  /** Primary language (normalized). */
  language: ProjectLanguage;
  /** Hex color associated with the language (GitHub palette). */
  languageColor: string;
  /** Star count (0 hides the badge). */
  stars: number;
  /** Up to 4 GitHub topics, lowercased. */
  topics: string[];
  /** GitHub repo URL. */
  githubUrl: string;
  /** Live demo URL (null when no deployment exists). */
  demoUrl: string | null;
  /** Whether this project has a live demo. */
  featured: boolean;
  /** ISO timestamp of last push. */
  pushedAt: string;
}
