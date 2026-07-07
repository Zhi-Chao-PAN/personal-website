import projectsData from '@/data/projects.generated.json';
import { getProjectDetail } from '@/lib/project-details';
import type { Project } from '@/lib/projects.types';

export const projects = projectsData.projects as Project[];
export const projectStats = projectsData.stats;

export const FEATURED_CASE_STUDY_SLUGS = [
  'launchlens-ai',
  'vision-centric-financial-swarm',
  'deepnerve-3d',
  'codex-zcode-remote-relay',
] as const;

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getProjectWithDetail(slug: string) {
  const project = getProjectBySlug(slug);
  if (!project) return null;

  return {
    project,
    detail: getProjectDetail(slug) ?? null,
  };
}

export function getFeaturedCaseStudies() {
  return FEATURED_CASE_STUDY_SLUGS.map((slug) => getProjectWithDetail(slug)).filter(
    (entry): entry is NonNullable<typeof entry> => entry !== null,
  );
}

export function getRelatedProjects(project: Project): Project[] {
  return project.references
    .map((slug) => getProjectBySlug(slug))
    .filter((entry): entry is Project => entry !== undefined);
}
