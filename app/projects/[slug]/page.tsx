import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProjectCaseStudy, SectionLabel } from '@/components/project-case-study';
import {
  getProjectWithDetail,
  getRelatedProjects,
  projects,
} from '@/lib/project-catalog';
import { CONTACT_EMAIL } from '@/lib/projects';
import { getProjectImage } from '@/lib/project-image';
import { SITE_TITLE } from '@/lib/site';

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getProjectWithDetail(slug);

  if (!entry) {
    return {
      title: 'Project not found | ZhiChao Pan',
    };
  }

  const { project, detail } = entry;
  const description = detail?.outcome ?? project.tagline;
  const title = `${project.name} | Case Study | ZhiChao Pan`;
  const ogImage = `/api/og/${project.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      title: `${project.name} | Case Study`,
      description,
      url: `/projects/${project.slug}`,
      siteName: SITE_TITLE,
      type: 'article',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${project.name} case study poster`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const entry = getProjectWithDetail(slug);

  if (!entry) notFound();

  const { project, detail } = entry;
  const relatedProjects = getRelatedProjects(project);
  const image = getProjectImage(project.slug, project.name);
  const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    `Question about ${project.name}`,
  )}`;

  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <section className="relative overflow-hidden border-b border-white/[0.07]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '42px 42px',
          }}
        />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 py-8 md:grid-cols-[0.92fr_1.08fr] md:py-14 lg:py-16">
          <div className="flex min-w-0 flex-col justify-between gap-10">
            <div>
              <Link
                href="/#case-studies"
                className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500 transition-colors hover:text-emerald-300"
              >
                &lt;- back to cases
              </Link>
              <div className="mt-10 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: project.languageColor }}
                />
                <span>{project.language}</span>
                {project.license ? (
                  <>
                    <span className="text-zinc-700">/</span>
                    <span>{project.license}</span>
                  </>
                ) : null}
                {project.demoUrl ? (
                  <>
                    <span className="text-zinc-700">/</span>
                    <span className="text-emerald-300/80">live demo</span>
                  </>
                ) : null}
              </div>
              <h1 className="mt-5 text-4xl font-black leading-[0.95] tracking-tight text-white md:text-6xl lg:text-7xl">
                {project.name}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-300 md:text-xl">
                {project.pitchZh ?? project.tagline}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <HeroStat label="stars" value={String(project.stars)} />
              <HeroStat label="commits" value={String(project.commits)} />
              <HeroStat label="size" value={project.sizeHuman} />
              <HeroStat
                label={project.headline?.label ?? 'updated'}
                value={project.headline?.value ?? project.pushedRelative}
              />
            </div>
          </div>

          <div className="relative aspect-[16/10] min-h-[18rem] overflow-hidden rounded-md border border-white/[0.08] bg-black shadow-2xl shadow-black/50">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 36rem, 100vw"
              className="object-cover"
              unoptimized={
                image.src.startsWith('/api/og') ||
                image.src.startsWith('https://raw.githubusercontent.com')
              }
            />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/90 via-black/45 to-transparent px-4 py-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/90">
                {image.label}
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-300">
                case file
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1fr)_18rem] lg:py-20">
        <div className="min-w-0">
          <ProjectCaseStudy project={project} detail={detail} className="space-y-10" />
        </div>

        <aside className="space-y-8 lg:sticky lg:top-8 lg:self-start">
          {project.topics.length > 0 ? (
            <section>
              <SectionLabel>tagged</SectionLabel>
              <div className="mt-3 flex flex-wrap gap-2">
                {project.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-md border border-white/10 bg-white/[0.02] px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <SectionLabel>links</SectionLabel>
            <div className="mt-3 grid gap-2">
              {project.demoUrl ? (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-emerald-400/30 bg-emerald-400/[0.06] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-emerald-300 transition-colors hover:border-emerald-300/60"
                >
                  live demo -&gt;
                </a>
              ) : null}
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-white/10 bg-white/[0.02] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-300 transition-colors hover:border-white/30 hover:text-white"
              >
                github repo -&gt;
              </a>
              <a
                href={mailto}
                className="rounded-md border border-sky-300/20 bg-sky-300/[0.04] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-sky-300 transition-colors hover:border-sky-300/50"
              >
                ask about this -&gt;
              </a>
            </div>
          </section>

          {relatedProjects.length > 0 ? (
            <section>
              <SectionLabel>related</SectionLabel>
              <div className="mt-3 grid gap-2">
                {relatedProjects.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/projects/${related.slug}`}
                    className="rounded-md border border-white/10 bg-white/[0.02] px-4 py-3 text-sm leading-snug text-zinc-300 transition-colors hover:border-emerald-400/40 hover:text-white"
                  >
                    {related.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </section>
    </main>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-white/[0.07] bg-white/[0.02] p-3">
      <div className="truncate font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-600">
        {label}
      </div>
      <div className="mt-1 truncate font-mono text-xl font-black tracking-tight text-white">
        {value}
      </div>
    </div>
  );
}
