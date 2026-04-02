import Hero from '@/components/Hero';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-[#030303]">
      <Hero />
      
      {/* ScrollTrigger container pre-setup for future sections */}
      <section className="h-screen w-full flex items-center justify-center bg-[#0a0a0a] border-t border-white/5">
        <div className="text-center font-mono text-zinc-600 tracking-widest text-sm">
          [ AWAITING_NEXT_MODULE ] <br />
          /* SCROLL DOWN TO REVEAL MORE EXPERIMENTS */
        </div>
      </section>
    </main>
  );
}
