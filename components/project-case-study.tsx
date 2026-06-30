import type { ProjectDetail } from '@/lib/project-details';
import type { Project } from '@/lib/projects.types';

interface ProjectCaseStudyProps {
  project: Project;
  detail: ProjectDetail | null;
  className?: string;
  sectionClassName?: string;
}

export function ProjectCaseStudy({
  project,
  detail,
  className = '',
  sectionClassName = '',
}: ProjectCaseStudyProps) {
  if (!detail) return null;

  return (
    <div className={className}>
      <section className={`case-study-section ${sectionClassName}`}>
        <SectionLabel>case study</SectionLabel>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <CaseBlock label="problem" text={detail.problem} />
          <CaseBlock label="approach" text={detail.approach} />
          <CaseBlock label="outcome" text={detail.outcome} accent />
        </div>
      </section>

      <section className={`case-study-section ${sectionClassName}`}>
        <SectionLabel>my role</SectionLabel>
        <ul className="mt-3 grid gap-2 md:grid-cols-3 text-sm text-zinc-400 leading-relaxed">
          {detail.role.map((item, i) => (
            <li key={item} className="border border-white/5 bg-white/[0.02] rounded-md p-3">
              <span className="block font-mono text-[9px] uppercase tracking-[0.25em] text-zinc-600 mb-2">
                {String(i + 1).padStart(2, '0')}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className={`case-study-section ${sectionClassName}`}>
        <SectionLabel>why it matters</SectionLabel>
        <p className="mt-3 text-zinc-200 text-base md:text-lg leading-relaxed font-light">
          {detail.philosophy}
        </p>
      </section>

      <section className={`case-study-section ${sectionClassName}`}>
        <SectionLabel>architecture</SectionLabel>
        <p className="mt-3 text-zinc-400 text-sm leading-relaxed">
          {detail.architecture}
        </p>
      </section>

      <section className={`case-study-section ${sectionClassName}`}>
        <SectionLabel>notes</SectionLabel>
        <ul className="mt-3 space-y-2 text-sm text-zinc-400 leading-relaxed">
          {detail.notes.map((note, i) => (
            <li key={note} className="flex gap-2.5">
              <span className="text-zinc-700 font-mono shrink-0 select-none">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{note}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`case-study-section ${sectionClassName}`}>
        <SectionLabel>stack</SectionLabel>
        <div className="mt-3 border border-white/5 rounded-md divide-y divide-white/5">
          {detail.stack.map((item) => (
            <div
              key={item.name}
              className="grid grid-cols-[1fr_auto] gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="font-mono text-sm text-zinc-200">{item.name}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-600 self-center">
                {item.role}
              </div>
            </div>
          ))}
        </div>
      </section>

      {project.headline ? (
        <section className={`case-study-section ${sectionClassName}`}>
          <SectionLabel>headline</SectionLabel>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <MetricBlock label={project.headline.label} value={project.headline.value} />
            <MetricBlock label="repo" value={project.sizeHuman} />
          </div>
        </section>
      ) : null}
    </div>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-500">
        {children}
      </span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );
}

export function CaseBlock({
  label,
  text,
  accent = false,
}: {
  label: string;
  text: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        accent
          ? 'relative rounded-md border border-emerald-400/20 bg-emerald-400/[0.04] p-4'
          : 'relative rounded-md border border-white/5 bg-white/[0.02] p-4'
      }
    >
      <div
        className={
          accent
            ? 'font-mono text-[9px] uppercase tracking-[0.3em] text-emerald-300/80'
            : 'font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600'
        }
      >
        {label}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-zinc-300">{text}</p>
    </div>
  );
}

function MetricBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] rounded-md p-3">
      <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-600">
        {label}
      </div>
      <div className="font-mono text-2xl font-black text-white tracking-tight mt-1">
        {value}
      </div>
    </div>
  );
}
