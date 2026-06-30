import Hero from '@/components/Hero';
import { AboutSection } from '@/components/about-section';
import { BilingualBriefSection } from '@/components/bilingual-brief';
import { FocusSection } from '@/components/focus-section';
import {
  ApplicationKitSection,
  FeaturedCaseStudiesSection,
  RoadmapSection,
  SkillMatrixSection,
  WorkingNotesSection,
} from '@/components/profile-upgrade-sections';
import { ProjectsSection } from '@/components/projects-section';
import { OutroSection } from '@/components/outro-section';
import projectsData from '@/data/projects.generated.json';
import type { Project } from '@/lib/projects.types';

export default function Home() {
  const projects = projectsData.projects as Project[];
  const stats = projectsData.stats;

  return (
    <main className="flex min-h-screen flex-col bg-[#030303]">
      <Hero />
      <AboutSection />
      <FocusSection />
      <FeaturedCaseStudiesSection />
      <BilingualBriefSection />
      <ApplicationKitSection />
      <SkillMatrixSection />
      <WorkingNotesSection />
      <RoadmapSection />
      <ProjectsSection projects={projects} stats={stats} />
      <OutroSection
        totalRepos={stats.totalRepos}
        totalStars={stats.totalStars}
        liveDemos={stats.liveDemos}
        totalSizeMb={stats.totalSizeMb}
      />
    </main>
  );
}
