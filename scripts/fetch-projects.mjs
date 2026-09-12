// Explicit metadata refresh. Editorial content and public visibility are never inferred.
import { readFile, writeFile, rename } from "node:fs/promises";
const root = new URL("../", import.meta.url);
const { projects } = JSON.parse(
  await readFile(new URL("data/portfolio.json", root), "utf8"),
);
const output = { fetchedAt: new Date().toISOString(), repositories: [] };
for (const project of projects.filter((p) => p.repoUrl)) {
  const url = new URL(project.repoUrl);
  if (
    url.hostname !== "github.com" ||
    !url.pathname.startsWith("/Zhi-Chao-PAN/")
  )
    throw new Error("Unexpected public repository URL");
  const response = await fetch(`https://api.github.com/repos${url.pathname}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "portfolio-metadata-refresh",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(
      `Metadata unavailable for ${project.slug}: ${response.status}. Existing snapshot preserved.`,
    );
  const repo = await response.json();
  if (repo.private || repo.fork)
    throw new Error(`Repository requires editorial review: ${project.slug}`);
  output.repositories.push({
    slug: project.slug,
    stars: repo.stargazers_count,
    pushedAt: repo.pushed_at,
    archived: repo.archived,
    defaultBranch: repo.default_branch,
  });
}
const target = new URL("data/github-metadata.json", root);
const temporary = new URL("data/github-metadata.json.tmp", root);
await writeFile(temporary, JSON.stringify(output, null, 2) + "\n");
await rename(temporary, target);
console.log(
  `Refreshed ${output.repositories.length} public repository metadata records. Editorial content unchanged.`,
);
