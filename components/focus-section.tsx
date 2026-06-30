const FOCUS_AREAS = [
  {
    label: '01 / applied product',
    title: '把 AI 做成可使用的产品',
    text:
      '我更关心真实流程里的输入、边界、失败恢复和结果复用，而不是一次性演示。好的 AI 产品应该让用户知道它为什么这么做、哪里可信、哪里需要人来判断。',
    accent: 'bg-sky-400',
  },
  {
    label: '02 / agent workflow',
    title: '把多智能体编排做成可验收的系统',
    text:
      '多智能体不只是“多个模型一起说话”，而是任务拆解、角色隔离、结构化输出、所有权边界和 review gate。每一步都应该能被追踪、复盘和替换。',
    accent: 'bg-emerald-400',
  },
  {
    label: '03 / rag & evaluation',
    title: '用评测把直觉变成证据',
    text:
      '从结构化 PDF 解析到模型对比，我在练习把质量问题具体化：固定变量、记录指标、保留失败样本，让改进不只停留在“感觉更好”。',
    accent: 'bg-amber-300',
  },
  {
    label: '04 / product engineering',
    title: '保持能交付、能维护、能继续迭代',
    text:
      'Next.js、TypeScript、Python、LangGraph 和本地自动化只是工具。真正重要的是把想法落到一个别人能打开、能理解、能继续使用的系统里。',
    accent: 'bg-rose-300',
  },
];

export function FocusSection() {
  return (
    <section
      id="focus"
      className="relative w-full bg-[#030303] border-y border-white/[0.06] py-24 md:py-28"
    >
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 md:grid-cols-[0.82fr_1.18fr] md:gap-16">
        <div className="md:sticky md:top-24 self-start">
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-600">
            [ now / focus ]
          </span>
          <h2 className="mt-5 text-3xl md:text-5xl font-black tracking-tight text-white leading-[1.05]">
            What I am sharpening now
          </h2>
          <p className="mt-6 max-w-md text-base md:text-lg leading-relaxed text-zinc-400">
            我现在把重心放在应用型 AI 产品、可验证的多智能体工作流、RAG
            与评测，以及能真正交付的产品工程。下面这些方向，也是作品区里每个项目共同指向的能力。
          </p>
        </div>

        <div className="divide-y divide-white/[0.07] border-y border-white/[0.07]">
          {FOCUS_AREAS.map((item) => (
            <article
              key={item.label}
              className="grid gap-4 py-6 md:grid-cols-[11rem_1fr] md:gap-8 md:py-7"
            >
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${item.accent}`} />
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                  {item.label}
                </span>
              </div>
              <div>
                <h3 className="text-xl md:text-2xl font-black tracking-tight text-zinc-100">
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
