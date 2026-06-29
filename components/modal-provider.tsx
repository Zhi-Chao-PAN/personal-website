'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

interface ProjectModalContextValue {
  /** Slug of the currently open project, or null. */
  openSlug: string | null;
  /** Open the modal for a project. */
  open: (slug: string) => void;
  /** Close any open modal. */
  close: () => void;
}

const ProjectModalContext = createContext<ProjectModalContextValue | null>(null);

export function ProjectModalProvider({ children }: { children: ReactNode }) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const open = useCallback((slug: string) => setOpenSlug(slug), []);
  const close = useCallback(() => setOpenSlug(null), []);

  return (
    <ProjectModalContext.Provider value={{ openSlug, open, close }}>
      {children}
    </ProjectModalContext.Provider>
  );
}

export function useProjectModal() {
  const ctx = useContext(ProjectModalContext);
  if (!ctx) {
    throw new Error('useProjectModal must be used inside <ProjectModalProvider>');
  }
  return ctx;
}
