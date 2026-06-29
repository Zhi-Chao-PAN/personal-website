import Hero from '@/components/Hero';
import { ProjectsSection } from '@/components/projects-section';
import projectsData from '@/data/projects.generated.json';
import type { Project } from '@/lib/projects.types';

export default function Home() {
  const projects = projectsData.projects as Project[];
  const stats = projectsData.stats;

  return (
    <main className="flex min-h-screen flex-col bg-[#030303]">
      <Hero />
      <ProjectsSection projects={projects} stats={stats} />
    </main>
  );
}
