'use client';

import { useState } from 'react';

const BRIEFS = {
  en: {
    label: 'English',
    eyebrow: '[ index_03 / bilingual brief ]',
    title: 'A short profile that travels well',
    intro:
      'I am a Computer Science student at Guangling College, Yangzhou University, preparing for the UTS Master of Artificial Intelligence and building toward applied AI product engineering.',
    points: [
      'My work focuses on multi-agent orchestration, RAG evaluation, and AI products that make model output reviewable and reusable.',
      'I care about the system around the model: workflow design, validation gates, evidence surfaces, and failure recovery.',
      'The long-term direction is AI Product Engineer / Full-Stack Agent Architect: someone who can connect product judgment, frontend experience, and agent infrastructure.',
    ],
  },
  zh: {
    label: '中文',
    eyebrow: '[ index_03 / 双语简介 ]',
    title: '一段能直接用于申请与合作沟通的简介',
    intro:
      '我是扬州大学广陵学院计算机科学与技术专业学生，正在准备申请悉尼科技大学 UTS 的人工智能授课型硕士，并长期走向应用 AI 产品工程。',
    points: [
      '目前关注多智能体编排、RAG 评测，以及让模型输出可审阅、可复用、可落地的 AI 产品。',
      '我更看重模型之外的系统设计：工作流、验证门禁、证据展示、失败恢复和真实用户场景。',
      '长期目标是成为 AI Product Engineer / Full-Stack Agent Architect，把产品判断、前端体验和智能体基础设施连接起来。',
    ],
  },
} as const;

type BriefLanguage = keyof typeof BRIEFS;

export function BilingualBriefSection() {
  const [language, setLanguage] = useState<BriefLanguage>('en');
  const brief = BRIEFS[language];

  return (
    <section id="bilingual-brief" className="relative w-full border-y border-white/[0.06] bg-[#050505] py-24 md:py-28">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 lg:grid-cols-[0.78fr_1.22fr]">
        <div>
          <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-zinc-600">
            {brief.eyebrow}
          </span>
          <h2 className="mt-5 text-3xl font-black leading-[1.05] tracking-tight text-white md:text-5xl">
            {brief.title}
          </h2>
          <div className="mt-8 inline-flex rounded-md border border-white/10 bg-black/30 p-1">
            {Object.entries(BRIEFS).map(([key, item]) => {
              const active = key === language;

              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setLanguage(key as BriefLanguage)}
                  className={
                    active
                      ? 'rounded px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-black bg-emerald-300'
                      : 'rounded px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500 transition-colors hover:text-white'
                  }
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        <article className="rounded-md border border-white/[0.07] bg-white/[0.02] p-5 md:p-6">
          <p className="text-lg leading-relaxed text-zinc-200 md:text-2xl">
            {brief.intro}
          </p>
          <div className="mt-6 divide-y divide-white/[0.07]">
            {brief.points.map((point, index) => (
              <p
                key={point}
                className="grid gap-3 py-4 text-sm leading-relaxed text-zinc-400 md:grid-cols-[3rem_1fr] md:text-base"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{point}</span>
              </p>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
