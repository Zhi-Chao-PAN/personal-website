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
const archivedTrace = JSON.parse(
  await readFile(
    new URL("../data/autoresearch-fresh-dev-agent-01-state.json", import.meta.url),
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
      "../public/evidence/autoresearch-v14-project-portfolio-pan-zhichao.pdf",
      "156f6a39cf6b6192ad9d9923709eb502550468ebfe346ab26a24c4b0c7fa98f3",
    ],
    [
      "../public/evidence/autoresearch-v14-noto-sans-sc-ofl.txt",
      "babcfe66c8a098b2fa279bc724a3a342f8124f77ce18941fbcc1bbb39823cded",
    ],
    [
      "../public/evidence/autoresearch-v13-project-portfolio-pan-zhichao.pdf",
      "9b77b27dde07175ae436636f7697a44741d549472861d0b276f432e0349c4db2",
    ],
    [
      "../public/evidence/autoresearch-v13-noto-sans-sc-ofl.txt",
      "babcfe66c8a098b2fa279bc724a3a342f8124f77ce18941fbcc1bbb39823cded",
    ],
    [
      "../public/evidence/autoresearch-v12-project-proof-pan-zhichao.pdf",
      "55970332983a8d8351cc63bcdb60080acbded9961a174a8cc1d9f014ed608d7f",
    ],
    [
      "../public/evidence/autoresearch-v12-application-addendum-pan-zhichao.zip",
      "a3a9557f5565ac80503f942051c8833e1905de3f5ef42c0dffbec0276e1c77a6",
    ],
    [
      "../public/evidence/autoresearch-v12-noto-sans-sc-ofl.txt",
      "babcfe66c8a098b2fa279bc724a3a342f8124f77ce18941fbcc1bbb39823cded",
    ],
    [
      "../public/evidence/autoresearch-v11-project-proof-pan-zhichao.pdf",
      "253d5a31dd512f56e72f06a680198b40e9b8b1383adade11aa12ad75c209d520",
    ],
    [
      "../public/evidence/autoresearch-v11-application-addendum-pan-zhichao.zip",
      "f3c601d90d49974e4fd164591eb9d8401047ea053df0caf958f196a792eaa343",
    ],
    [
      "../public/evidence/autoresearch-v11-noto-sans-sc-ofl.txt",
      "babcfe66c8a098b2fa279bc724a3a342f8124f77ce18941fbcc1bbb39823cded",
    ],
    [
      "../public/evidence/autoresearch-v5-project-proof-pan-zhichao.pdf",
      "ed18147cd02e676a5c43ff7a6db3949eea2f909cc2bf61d129847f9c5cdd78cc",
    ],
    [
      "../public/evidence/autoresearch-v7-application-addendum-pan-zhichao.zip",
      "dacdcba5dd77d91a21769e36164f517d192a8e79bfad48831e8f5f31fa026445",
    ],
    [
      "../public/evidence/autoresearch-v9-project-proof-pan-zhichao.pdf",
      "fa23a097271890ecc022f0dedc1e8f43ece8650fabb7937efa9c684ef96ba3e8",
    ],
    [
      "../public/evidence/autoresearch-v9-application-addendum-pan-zhichao.zip",
      "98051c0bec295b8be6e66513ddf6c8a5c13fed5040d9120821a97731149ea91a",
    ],
    [
      "../public/evidence/autoresearch-v9-noto-sans-sc-ofl.txt",
      "babcfe66c8a098b2fa279bc724a3a342f8124f77ce18941fbcc1bbb39823cded",
    ],
    [
      "../public/evidence/autoresearch-v10-project-proof-pan-zhichao.pdf",
      "fdb8e3c40a9aaed9d9d2eca4889bcc88b1f318be15ae7522444855c9a86d9a3d",
    ],
    [
      "../public/evidence/autoresearch-v10-application-addendum-pan-zhichao.zip",
      "23eb83af909c5e24a290026951d1393959694aab851afd80eb896c8873487f7c",
    ],
    [
      "../public/evidence/autoresearch-v10-noto-sans-sc-ofl.txt",
      "babcfe66c8a098b2fa279bc724a3a342f8124f77ce18941fbcc1bbb39823cded",
    ],
  ]) {
    const bytes = await readFile(new URL(file, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), expected);
  }
});
test("AutoResearch reviewer trace demo pins the archived r2 sources and negative comparison", async () => {
  const trace = examples.autoresearch;
  assert.match(trace.stateSource, /e23760f64c772cf7225280a991fd102740c78def/);
  assert.match(trace.lockSource, /selection_lock\.json$/);
  assert.equal(trace.bundleSha256, "5298f2733475e59e83f47efc46ade3d9eb03b314849d7e1079ed52baeb67004a");
  assert.equal(trace.stateSha256, "66db1a0a2b58af5cc4ae79caefe5974a2353f202f912b8a85a9fa8746a656348");
  assert.equal(trace.selectionLockSha256, "22f47a9ec443256ef4318c4986ce4a0593d5327e95e5df03fbf82a85e2b1101c");
  assert.equal(trace.publicTestNdcg, "0.3070440739845281");
  assert.equal(trace.presetSearchNdcg, "0.307294");
  const bytes = await readFile(
    new URL("../data/autoresearch-fresh-dev-agent-01-state.json", import.meta.url),
  );
  assert.equal(
    createHash("sha256").update(bytes).digest("hex"),
    trace.stateSha256,
  );
  assert.equal(archivedTrace.trials.length, 6);
  assert.equal(trace.englishHypothesisTranslations.length, archivedTrace.trials.length);
  assert.deepEqual(
    archivedTrace.trials.map((trial) => ({
      trial: trial.trial,
      k: trial.candidate.k,
      bm25Weight: trial.candidate.bm25_weight,
      hypothesis: trial.hypothesis,
      ndcg: trial.metrics["ndcg@10"].toFixed(6),
      wallSeconds: trial.wall_seconds.toFixed(3),
    })),
    [
      { trial: 1, k: 60, bm25Weight: 0.5, hypothesis: "以中等融合深度与均衡权重建立首个开发集参考点。", ndcg: "0.265104", wallSeconds: "0.208" },
      { trial: 2, k: 60, bm25Weight: 0.7, hypothesis: "在相同融合深度下提高BM25占比，检验词项匹配信号是否更强。", ndcg: "0.264644", wallSeconds: "0.206" },
      { trial: 3, k: 60, bm25Weight: 0.3, hypothesis: "第二次提高BM25未改善nDCG，因此对称降低BM25占比检验TF-IDF侧。", ndcg: "0.260736", wallSeconds: "0.206" },
      { trial: 4, k: 20, bm25Weight: 0.5, hypothesis: "权重偏离均衡均降低nDCG，保持均衡并降低k以强化前排文档影响。", ndcg: "0.264773", wallSeconds: "0.236" },
      { trial: 5, k: 100, bm25Weight: 0.5, hypothesis: "较小k略差于首点，改用更大k平滑名次差异并保持均衡权重。", ndcg: "0.265183", wallSeconds: "0.203" },
      { trial: 6, k: 150, bm25Weight: 0.5, hypothesis: "增大到100获得当前最佳nDCG，继续提高k检验平滑效应是否仍有收益。", ndcg: "0.264955", wallSeconds: "0.182" },
    ],
  );
});
