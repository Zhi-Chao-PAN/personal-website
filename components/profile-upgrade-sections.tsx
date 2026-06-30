import Image from 'next/image';
import Link from 'next/link';
import { CONTACT_EMAIL, GITHUB_OWNER } from '@/lib/projects';
import { getFeaturedCaseStudies } from '@/lib/project-catalog';
import { getProjectImage } from '@/lib/project-image';
import { PixelCard } from './reactbits-pixel-card';
import { SpotlightCard } from './reactbits-spotlight-card';

const APPLICATION_ITEMS = [
  {
    label: 'identity',
    title: 'Computer Science student building applied AI products',
    text: '扬州大学广陵学院计算机科学与技术专业学生，正在准备海外高校 AI / 计算机相关硕士方向，并长期走向应用 AI 产品工程。',
  },
  {
    label: 'casework',
    title: 'Representative work is organized as case studies',
    text: '每个项目都按 problem / approach / outcome / role 展开，重点呈现真实贡献、技术取舍和可复用价值，而不是只展示技术栈列表。',
  },
  {
    label: 'contact',
    title: 'For graduate review, collaboration, and technical conversations',
    text: '如果需要更正式的材料，可以通过邮件索取英文简历、项目摘要或补充说明；这个网站保留公开版本，便于快速了解方向和能力证据。',
  },
] as const;

const SKILL_MATRIX = [
  {
    label: 'AI product engineering',
    level: 'product workflow',
    proof: 'LaunchLens AI',
    href: '/projects/launchlens-ai',
    text: '把模糊业务问题拆成可执行流程：输入约束、结构化输出、验证步骤、可复用结果。',
    accent: 'bg-sky-400',
  },
  {
    label: 'Multi-agent orchestration',
    level: 'bounded delegation',
    proof: 'ZCode Relay',
    href: '/projects/codex-zcode-remote-relay',
    text: '关注角色边界、所有权、调度账本、review gate 和失败恢复，而不是把多个模型简单串起来。',
    accent: 'bg-emerald-400',
  },
  {
    label: 'RAG & evaluation',
    level: 'evidence first',
    proof: 'Structure-Aware RAG',
    href: '/projects/structure-aware-rag-empirical',
    text: '用固定变量、可复现实验和失败样本解释质量差异，把“感觉更好”变成可以复查的证据。',
    accent: 'bg-amber-300',
  },
  {
    label: 'ML reliability',
    level: 'uncertainty aware',
    proof: 'Battery Prognostics',
    href: '/projects/safety-critical-battery-prognostics',
    text: '把安全边界、不确定性和现实数据限制放进系统设计，而不是只追逐一个漂亮的指标。',
    accent: 'bg-rose-300',
  },
] as const;

const ROADMAP = [
  {
    horizon: '0-30 days',
    title: 'Make each case page easier to review from the outside',
    text: '补齐更多项目的英文摘要、关键截图和可分享链接，让海外硕士申请、邮件介绍和合作沟通都能直接引用。',
  },
  {
    horizon: '31-60 days',
    title: 'Build an agent evaluation dashboard',
    text: '围绕多智能体任务拆解、输出质量、成本和失败恢复做一套可复现实验面板。',
  },
  {
    horizon: '61-90 days',
    title: 'Publish working notes on RAG and agent systems',
    text: '把 Structure-Aware RAG、ZCode Relay 和 LaunchLens 的经验整理成短技术札记，形成公开技术判断。',
  },
] as const;

const WORKING_NOTES = [
  {
    status: 'drafting',
    title: 'Structure-aware parsing is an evaluation lever, not a preprocessing detail',
    text: '把 PDF 表格、跨行语义和检索错误拆开看，才能解释为什么同一个模型在不同解析器下表现差异明显。',
    href: '/projects/structure-aware-rag-empirical',
  },
  {
    status: 'field note',
    title: 'Bounded delegation makes multi-agent coding usable',
    text: '多智能体协作真正难的不是“多”，而是任务边界、文件所有权、验收门禁和失败恢复。',
    href: '/projects/codex-zcode-remote-relay',
  },
  {
    status: 'product note',
    title: 'AI products need review surfaces, not just prompt surfaces',
    text: '一个能落地的 AI 工作流，应该让用户看见输入约束、结构化输出、证据、风险和下一步，而不是只给一段回答。',
    href: '/projects/launchlens-ai',
  },
] as const;

export function FeaturedCaseStudiesSection() {
  const cases = getFeaturedCaseStudies();

  return (
    <section id="case-studies" className="relative w-full bg-[#030303] py-24 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-[0.72fr_1.28fr] md:gap-12">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-600">
              [ index_02 / featured cases ]
            </span>
            <h2 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white leading-[1.05]">
              Three case studies to open first
            </h2>
            <p className="mt-6 max-w-md text-base md:text-lg leading-relaxed text-zinc-400">
              这三个案例分别代表 AI 产品工程、多智能体编排和 RAG/评测能力，也构成我当前最清晰的技术主线。
            </p>
          </div>

          <div className="grid gap-4">
            {cases.map(({ project, detail }, index) => {
              const image = getProjectImage(project.slug, project.name);

              return (
                <SpotlightCard
                  as="article"
                  key={project.slug}
                  spotlightColor="rgba(52, 211, 153, 0.16)"
                  spotlightSize={460}
                  className="grid gap-4 border border-white/[0.07] bg-white/[0.02] p-3 md:grid-cols-[13rem_1fr] rounded-md transition-colors hover:border-emerald-400/25 hover:bg-white/[0.035]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden rounded-md border border-white/[0.08] bg-black">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes="(min-width: 768px) 13rem, 100vw"
                      className="object-cover"
                      unoptimized={
                        image.src.startsWith('/api/og') ||
                        image.src.startsWith('https://raw.githubusercontent.com')
                      }
                    />
                    <span className="absolute left-2 top-2 font-mono text-[9px] uppercase tracking-[0.25em] text-white/90 bg-black/60 px-2 py-1 rounded">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-col justify-between gap-4 p-1">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                        <span>{project.language}</span>
                        <span>·</span>
                        <span>{project.featured ? 'live demo' : 'repo case'}</span>
                      </div>
                      <h3 className="mt-3 text-2xl font-black tracking-tight text-white">
                        {project.name}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                        {detail?.outcome ?? project.tagline}
                      </p>
                    </div>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="w-fit font-mono text-[11px] uppercase tracking-[0.25em] text-emerald-300 hover:text-emerald-200 transition-colors"
                    >
                      open case page ↗
                    </Link>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ApplicationKitSection() {
  const githubUrl = `https://github.com/${GITHUB_OWNER}`;
  const mailto = `mailto:${CONTACT_EMAIL}?subject=Portfolio%20/%20Resume%20Request`;

  return (
    <section id="application-kit" className="relative w-full border-y border-white/[0.06] bg-[#050505] py-24 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-600">
            [ index_04 / profile kit ]
          </span>
          <h2 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white leading-[1.05]">
            A compact profile, grounded in shipped work
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={mailto}
              className="rounded-md border border-emerald-400/30 bg-emerald-400/[0.06] px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-emerald-300 hover:border-emerald-300/60 transition-colors"
            >
              resume / cv
            </a>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-white/10 bg-white/[0.02] px-4 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-zinc-300 hover:border-white/30 hover:text-white transition-colors"
            >
              github ↗
            </a>
          </div>
        </div>

        <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {APPLICATION_ITEMS.map((item) => (
            <SpotlightCard
              as="article"
              key={item.label}
              spotlightColor="rgba(56, 189, 248, 0.12)"
              spotlightSize={420}
              className="py-6 px-0 md:px-2"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                {item.label}
              </div>
              <h3 className="mt-3 text-xl md:text-2xl font-black tracking-tight text-zinc-100">
                {item.title}
              </h3>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-zinc-400">
                {item.text}
              </p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SkillMatrixSection() {
  return (
    <section id="skills" className="relative w-full bg-[#030303] py-24 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="max-w-3xl">
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-600">
            [ index_05 / skill matrix ]
          </span>
          <h2 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white leading-[1.05]">
            Capabilities shown through projects
          </h2>
          <p className="mt-6 text-base md:text-lg leading-relaxed text-zinc-400">
            能力不单独罗列，而是落在可以打开的项目里：产品工作流、多智能体编排、RAG 评测和可靠性实验都有对应案例。
          </p>
        </div>

        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {SKILL_MATRIX.map((skill) => (
            <PixelCard
              as="article"
              key={skill.label}
              className="rounded-md border border-white/[0.07] bg-white/[0.02] p-5 transition-colors hover:border-emerald-400/25 hover:bg-white/[0.035]"
              colors="#6ee7b7,#38bdf8,#fde68a,#f0abfc"
              gap={14}
              speed={24}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${skill.accent}`} />
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                    {skill.level}
                  </span>
                </div>
                <Link
                  href={skill.href}
                  className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 hover:text-emerald-300 transition-colors"
                >
                  case ↗
                </Link>
              </div>
              <h3 className="mt-4 text-xl md:text-2xl font-black tracking-tight text-white">
                {skill.label}
              </h3>
              <p className="mt-3 text-sm md:text-base leading-relaxed text-zinc-400">
                {skill.text}
              </p>
              <div className="mt-4 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                case: <span className="text-zinc-400">{skill.proof}</span>
              </div>
            </PixelCard>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RoadmapSection() {
  return (
    <section id="next-90-days" className="reactbits-roadmap-stage relative w-full border-y border-white/[0.06] bg-[#050505] py-24 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 lg:grid-cols-[0.82fr_1.18fr]">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-600">
            [ index_07 / next 90 days ]
          </span>
          <h2 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white leading-[1.05]">
            What I am building next
          </h2>
          <p className="mt-6 max-w-md text-base md:text-lg leading-relaxed text-zinc-400">
            这个网站会继续更新。接下来三个月，重点是让案例页更完整、实验更可复现、公开技术写作更清晰。
          </p>
        </div>

        <div className="space-y-3">
          {ROADMAP.map((item) => (
            <article
              key={item.horizon}
              className="reactbits-roadmap-item grid gap-3 rounded-md border border-white/[0.07] bg-white/[0.02] p-5 md:grid-cols-[8rem_1fr]"
            >
              <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">
                {item.horizon}
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm md:text-base leading-relaxed text-zinc-400">
                  {item.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WorkingNotesSection() {
  return (
    <section id="working-notes" className="reactbits-notes-stage relative w-full bg-[#030303] py-24 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:gap-12">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-600">
              [ index_06 / working notes ]
            </span>
            <h2 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white leading-[1.05]">
              Working notes behind the projects
            </h2>
            <p className="mt-6 max-w-md text-base md:text-lg leading-relaxed text-zinc-400">
              这些笔记补充项目页面没有展开的部分：问题如何拆解、结果如何验证、哪些边界还值得继续研究。
            </p>
          </div>

          <div className="grid gap-3">
            {WORKING_NOTES.map((note) => (
              <Link
                key={note.title}
                href={note.href}
                className="reactbits-note-item group grid gap-4 rounded-md border border-white/[0.07] bg-white/[0.02] p-5 transition-colors hover:border-emerald-400/35 hover:bg-white/[0.035] md:grid-cols-[8rem_1fr]"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-300/80">
                  {note.status}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight text-white group-hover:text-emerald-50">
                    {note.title}
                  </h3>
                  <p className="mt-3 text-sm md:text-base leading-relaxed text-zinc-400">
                    {note.text}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
