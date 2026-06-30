import type { MetadataRoute } from 'next';
import { projects } from '@/lib/project-catalog';
import { SITE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const latestProjectUpdate = projects.reduce<Date | null>((latest, project) => {
    const pushedAt = new Date(project.pushedAt);
    if (Number.isNaN(pushedAt.getTime())) return latest;
    if (!latest || pushedAt > latest) return pushedAt;
    return latest;
  }, null);

  return [
    {
      url: SITE_URL,
      lastModified: latestProjectUpdate ?? new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: new Date(project.pushedAt),
      changeFrequency: 'monthly' as const,
      priority: project.featured ? 0.85 : 0.72,
    })),
  ];
}
