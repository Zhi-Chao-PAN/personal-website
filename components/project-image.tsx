'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { ProjectImage as ProjectImageType } from '@/lib/project-image';

interface ProjectImageProps {
  image: ProjectImageType;
  priority?: boolean;
}

/** Card-top image: 16:9 cover with type label, skeleton placeholder,
 *  and a hover-only "view details →" overlay (the overlay signals the
 *  card is clickable rather than acting as a link itself).
 */
export function ProjectImage({ image, priority = false }: ProjectImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md border border-white/5 group-hover/card:border-white/15 transition-colors bg-[#0a0a0a]">
      {/* Skeleton shimmer */}
      {!loaded ? (
        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02] animate-pulse" />
      ) : null}

      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className={`object-cover transition-all duration-700 ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
        }`}
        onLoad={() => setLoaded(true)}
        priority={priority}
        // GitHub raw CDN already serves optimized static PNGs, and the OG
        // route returns an optimized PNG — bypass Next's image optimizer
        // for both to avoid the remotePatterns 400 we were hitting.
        unoptimized={
          image.src.startsWith('/api/og') ||
          image.src.startsWith('https://raw.githubusercontent.com')
        }
      />

      {/* Top-left type label */}
      <span className="absolute top-3 left-3 font-mono text-[9px] uppercase tracking-[0.25em] text-white/90 bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
        {image.label}
      </span>

      {/* Top-right corner: tick */}
      <span className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-400/50" />
      <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-400/50" />

      {/* Hover overlay — VIEW DETAILS */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
        <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-white bg-black/70 backdrop-blur-sm px-4 py-2 rounded">
          view details →
        </span>
      </div>
    </div>
  );
}
