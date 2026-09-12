import type { MetadataRoute } from "next";
import { portfolio, pagePath, siteUrl, updatedAt } from "@/lib/portfolio";
export default function sitemap(): MetadataRoute.Sitemap {
  return [undefined, ...portfolio].flatMap((project) =>
    (["en", "zh"] as const).map((locale) => ({
      url: `${siteUrl}${pagePath(locale, project?.slug)}`,
      lastModified: updatedAt,
      changeFrequency: "monthly" as const,
      priority: project ? (project.tier === "flagship" ? 0.9 : 0.7) : 1,
      alternates: {
        languages: {
          en: `${siteUrl}${pagePath("en", project?.slug)}`,
          "zh-CN": `${siteUrl}${pagePath("zh", project?.slug)}`,
        },
      },
    })),
  );
}
