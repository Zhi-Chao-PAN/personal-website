import { ImageResponse } from "next/og";
import projectsData from "@/data/projects.generated.json";
import type { Project } from "@/lib/projects.types";

export const runtime = "edge";

const OG_SIZE = { width: 1200, height: 630 } as const;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const project = (projectsData.projects as Project[]).find((p) => p.slug === slug);
  if (!project) return new Response("Not found", { status: 404 });

  const headline = project.headline;
  const stack = project.stack.slice(0, 3);
  const langName = project.languages[0]?.name ?? project.language;
  const langColor = project.languages[0]?.color ?? project.languageColor;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#030303",
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          color: "#ededed",
          fontFamily: "sans-serif",
          padding: "64px 80px",
          position: "relative",
        }}
      >
        {/* Top label row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 16,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#52525b",
            fontFamily: "monospace",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: "#3f3f46" }}>[</span>
            <span>og poster</span>
            <span style={{ color: "#3f3f46" }}>]</span>
            <span style={{ color: "#3f3f46" }}>/</span>
            <span style={{ color: "#a1a1aa" }}>{slug}</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              color: langName === "TypeScript" ? "#3178c6" : langName === "Python" ? "#3572A5" : "#a1a1aa",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 9999,
                backgroundColor: langColor,
              }}
            />
            {langName}
          </div>
        </div>

        {/* Project name — large headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 80,
            gap: 16,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: "-0.04em",
              lineHeight: 0.95,
              color: "#ffffff",
              maxWidth: 950,
            }}
          >
            {project.name}
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 300,
              color: "#a1a1aa",
              maxWidth: 880,
              lineHeight: 1.4,
            }}
          >
            {project.tagline.length > 110
              ? project.tagline.slice(0, 107) + "…"
              : project.tagline}
          </div>
        </div>

        {/* Bottom row: stack chips + headline */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: "auto",
            paddingTop: 32,
          }}
        >
          {/* Stack chips */}
          <div style={{ display: "flex", gap: 12 }}>
            {stack.map((entry) => (
              <div
                key={entry.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px 16px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backgroundColor: "rgba(255,255,255,0.02)",
                  borderRadius: 6,
                  fontSize: 18,
                  color: "#a1a1aa",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                }}
              >
                {entry.name}
              </div>
            ))}
          </div>

          {/* Headline metric */}
          {headline ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 6,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "#52525b",
                  fontFamily: "monospace",
                }}
              >
                {headline.label}
              </div>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  color: "#ffffff",
                  fontFamily: "monospace",
                  letterSpacing: "-0.02em",
                }}
              >
                {headline.value}
              </div>
            </div>
          ) : null}
        </div>

        {/* Corner tick — lab readout feel */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 32,
            height: 32,
            borderTop: "2px solid rgba(16,185,129,0.6)",
            borderRight: "2px solid rgba(16,185,129,0.6)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: 32,
            height: 32,
            borderBottom: "2px solid rgba(16,185,129,0.6)",
            borderLeft: "2px solid rgba(16,185,129,0.6)",
          }}
        />
      </div>
    ),
    { ...OG_SIZE }
  );
}
