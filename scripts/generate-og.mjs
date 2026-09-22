import { readFile, mkdir } from "node:fs/promises";
import sharp from "sharp";
const root = new URL("../", import.meta.url);
const { projects } = JSON.parse(
  await readFile(new URL("data/portfolio.json", root), "utf8"),
);
await mkdir(new URL("public/og/", root), { recursive: true });
const escape = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
function wrap(text, limit, locale) {
  const tokens = locale === "zh" ? [...text] : text.split(" "),
    lines = [];
  let line = "";
  for (const token of tokens) {
    const next = line + (line && locale !== "zh" ? " " : "") + token;
    if (next.length > limit && line) {
      lines.push(line);
      line = token;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}
for (const project of [null, ...projects])
  for (const locale of ["en", "zh"]) {
    const title =
      project?.name ??
      (locale === "zh" ? "潘志超 · ZhiChao Pan" : "ZhiChao Pan.");
    const summary =
      project?.content[locale].summary ??
      (locale === "zh"
        ? "把想法做成产品，把判断落到证据。"
        : "Useful AI products. Judgment you can follow.");
    const titleLines = wrap(title, 29, "en"),
      copyLines = wrap(summary, locale === "zh" ? 36 : 68, locale);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#080c0a"/><rect width="1200" height="9" fill="#b4f5b6"/><g font-family="Noto Sans CJK SC, sans-serif"><text x="76" y="85" fill="#b4f5b6" font-size="20">ZP. / PERSONAL LAB</text><text x="1124" y="85" fill="#9faf9f" text-anchor="end" font-size="17">${locale === "zh" ? "精选作品 · 2026" : "SELECTED WORK · 2026"}</text>${titleLines.map((s, i) => `<text x="72" y="${195 + i * 82}" fill="#ecf0e9" font-weight="700" font-size="72" letter-spacing="-3">${escape(s)}</text>`).join("")}${copyLines.map((s, i) => `<text x="76" y="${titleLines.length > 1 ? 345 + i * 39 : 285 + i * 39}" fill="#b7c4b8" font-size="25">${escape(s)}</text>`).join("")}<line x1="76" x2="1124" y1="540" y2="540" stroke="#334238"/><text x="76" y="581" fill="#b4f5b6" font-size="17">${escape(project?.content[locale].eyebrow ?? (locale === "zh" ? "产品 · 评测 · 智能体工具" : "PRODUCT · EVALUATION · AGENT TOOLING"))}</text><text x="1124" y="581" text-anchor="end" fill="#b4f5b6" font-size="18">panzhichao.com ↗</text></g></svg>`;
    await sharp(Buffer.from(svg))
      .png()
      .toFile(
        new URL(`public/og/${project?.slug ?? "home"}-${locale}.png`, root)
          .pathname,
      );
  }
console.log(
  `Generated ${(projects.length + 1) * 2} local, bilingual sharing images.`,
);
