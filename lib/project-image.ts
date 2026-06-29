/**
 * Project image resolver.
 *
 * 4 repos have real screenshots checked into the repo
 * (sourced from raw.githubusercontent.com). The remaining 3
 * fall back to /api/og/[slug] which dynamically generates a
 * branded 1200×630 poster via @vercel/og.
 */

export type ImageType = "screenshot" | "benchmark" | "og-poster";

export interface ProjectImage {
  /** Image URL (or path for the OG route). */
  src: string;
  /** Type of asset — affects card label. */
  type: ImageType;
  /** Short uppercase label rendered in the image's top-left corner. */
  label: string;
  /** Accessible alt text. */
  alt: string;
}

const NATIVE_IMAGES: Record<string, ProjectImage> = {
  "launchlens-ai": {
    src: "https://raw.githubusercontent.com/Zhi-Chao-PAN/launchlens-ai/main/public/screenshots/launchlens-desktop.png",
    type: "screenshot",
    label: "DESKTOP",
    alt: "LaunchLens AI — desktop dashboard",
  },
  "launchlens-research-studio": {
    src: "https://raw.githubusercontent.com/Zhi-Chao-PAN/launchlens-research-studio/master/baselines/e2e-05-dark-mode.png",
    type: "screenshot",
    label: "DARK MODE",
    alt: "LaunchLens Research Studio — dark mode",
  },
  "safety-critical-battery-prognostics": {
    src: "https://raw.githubusercontent.com/Zhi-Chao-PAN/safety-critical-battery-prognostics/main/robustness_results/robustness_comparison.png",
    type: "benchmark",
    label: "BENCHMARK",
    alt: "Safety-Critical Battery Prognostics — robustness comparison",
  },
  "structure-aware-rag-empirical": {
    src: "https://raw.githubusercontent.com/Zhi-Chao-PAN/structure-aware-rag-empirical/main/report/accuracy_comparison.png",
    type: "benchmark",
    label: "BENCHMARK",
    alt: "Structure-Aware RAG — accuracy comparison",
  },
};

const FALLBACK_IMAGE: Omit<ProjectImage, "alt"> = {
  src: "",
  type: "og-poster",
  label: "OG POSTER",
};

export function getProjectImage(slug: string, displayName?: string): ProjectImage {
  if (NATIVE_IMAGES[slug]) return NATIVE_IMAGES[slug];
  return {
    ...FALLBACK_IMAGE,
    src: `/api/og/${slug}`,
    alt: `${displayName ?? slug} — generated poster`,
  };
}
