import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const { projects } = JSON.parse(
  await readFile(new URL("../data/portfolio.json", import.meta.url), "utf8"),
);
const examples = JSON.parse(
  await readFile(
    new URL("../data/public-examples.json", import.meta.url),
    "utf8",
  ),
);
test("curated catalog preserves legacy URLs, public visibility and flagship order", () => {
  const slugs = projects.map((p) => p.slug);
  assert.equal(new Set(slugs).size, 14);
  for (const slug of [
    "CampusTradeAI",
    "LangGraph-Financial-Swarm",
    "ai-life-progress-coach",
    "vision-centric-financial-swarm",
    "deepnerve-3d",
  ])
    assert.ok(slugs.includes(slug));
  assert.deepEqual(
    projects.filter((p) => p.tier === "flagship").map((p) => p.slug),
    ["launchlens-ai", "llm-evaluation-playbook", "ai-cli-orchestrator"],
  );
  assert.deepEqual(
    projects.filter((p) => p.tier === "selected").map((p) => p.slug),
    [
      "autoresearch-evidence-pack",
      "model-eval-studio",
      "structure-aware-rag-empirical",
      "safety-critical-battery-prognostics",
    ],
  );
  assert.equal(projects.filter((p) => p.tier === "archive").length, 7);
  assert.equal(projects.filter((p) => p.repoUrl).length, 10);
  assert.equal(projects.filter((p) => p.demoUrl).length, 3);
  for (const p of projects) {
    assert.ok(
      p.related.every((s) => slugs.includes(s) && s !== p.slug),
      p.slug,
    );
    if (p.kind === "private") assert.equal(p.repoUrl, null);
    for (const url of [
      p.repoUrl,
      p.demoUrl,
      ...p.evidence.map((e) => e.url),
    ].filter(Boolean)) {
      assert.equal(new URL(url).protocol, "https:");
      assert.ok(
        !/example\.com|2502\.12345|localhost|127\.0\.0\.1/.test(url),
        url,
      );
    }
  }
});
test("both languages contain complete cases, decisions and evidence labels", () => {
  for (const p of projects)
    for (const locale of ["en", "zh"]) {
      const c = p.content[locale];
      for (const k of ["eyebrow", "summary", "problem", "outcome"])
        assert.ok(c[k]?.trim().length > 5, `${p.slug}/${locale}/${k}`);
      assert.ok(c.role.length > 0 && c.limits.length > 0);
      assert.ok(c.decisions.length >= (p.tier === "flagship" ? 3 : 1));
      for (const d of c.decisions)
        for (const k of ["title", "choice", "tradeoff", "verification"])
          assert.ok(d[k].trim(), `${p.slug}/${k}`);
      for (const e of p.evidence) assert.ok(e.label[locale].trim());
      if (locale === "zh") assert.match(c.summary, /[\u4e00-\u9fff]/);
    }
});
test("published synthetic MRR example reproduces the source reference", () => {
  const rows = examples.playbook.cohorts;
  const base = rows.reduce((s, r) => s + r.mrr, 0);
  const churn = rows.reduce((s, r) => s + r.mrr * r.churn, 0);
  const expansion = rows.reduce((s, r) => s + r.mrr * r.expansion, 0);
  assert.equal(rows.length, 8);
  assert.equal(base, 5000000);
  assert.equal(churn, 298300);
  assert.equal(expansion, 115800);
  assert.equal(base - churn + expansion, 4817500);
  assert.equal(examples.playbook.relativeTolerance, 0.02);
});
test("AutoResearch public evidence files match the frozen source packages", async () => {
  for (const [file, expected] of [
    [
      "../public/evidence/autoresearch-v5-project-proof-pan-zhichao.pdf",
      "ed18147cd02e676a5c43ff7a6db3949eea2f909cc2bf61d129847f9c5cdd78cc",
    ],
    [
      "../public/evidence/autoresearch-v7-application-addendum-pan-zhichao.zip",
      "cef4e5f0d1f6864afcfa3384a04523399949b56b5c3f451df86c80cd7aa7b71f",
    ],
  ]) {
    const bytes = await readFile(new URL(file, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), expected);
  }
});
