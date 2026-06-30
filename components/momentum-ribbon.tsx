const RIBBON_TOPICS = [
  'AI Product Engineering',
  'Multi-Agent Orchestration',
  'RAG Evaluation',
  'Reliable ML',
  'Next.js Systems',
  'LangGraph Workflows',
  'Verifiable Results',
] as const;

function RibbonRow({ reverse = false }: { reverse?: boolean }) {
  const items = [...RIBBON_TOPICS, ...RIBBON_TOPICS];

  return (
    <div
      aria-hidden
      className="reactbits-velocity-row"
      data-reverse={reverse ? 'true' : undefined}
    >
      <div className="reactbits-velocity-track">
        {items.map((item, index) => (
          <span key={`${item}-${index}`} className="reactbits-velocity-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MomentumRibbon() {
  return (
    <section aria-label="Current technical focus" className="reactbits-velocity-ribbon">
      <p className="sr-only">{RIBBON_TOPICS.join(', ')}</p>
      <RibbonRow />
      <RibbonRow reverse />
    </section>
  );
}
