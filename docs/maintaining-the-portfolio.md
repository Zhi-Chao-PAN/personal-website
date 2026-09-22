# Updating the portfolio

The website uses Next.js 16 and the existing Vercel project. English URLs remain at `/` and `/projects/<slug>`; Chinese pages live at `/zh` and `/zh/projects/<slug>`. Existing mixed-case project slugs must stay unchanged.

## Content

Edit `data/portfolio.json`. This is the only project catalog: identity, order, public links, tiers, translated case text, relationships and reviewed evidence live together. There are three flagship projects, four selected projects and seven archive projects. The catalog drives the homepage, case routes, counts, metadata and sitemap.

Write both languages together. Describe actual ownership, tradeoffs and verification scope. A successful CI run establishes the behavior covered by that run, not product adoption, live provider compatibility or a general benchmark improvement. A public overview of private work must not gain a source link without a separate publication decision.

Use `data/public-examples.json` for the three local examples. Keep its published-source references, synthetic-data labels and bounded scoring explanation. The examples do not call a model service.

## Refresh and validate

1. Update the catalog and `docs/content-evidence.md` with the reviewed source and date. Set the catalog date only when publishing a content update.
2. `npm run refresh:metadata` optionally updates `data/github-metadata.json`. It fetches only curated public repositories, preserves the old snapshot on failure and never changes editorial text or visibility. Repository timestamps do not claim live feature testing.
3. Run `npm run generate:og` after copy changes, then inspect generated English and Chinese PNGs. This script uses Sharp and the Noto Sans CJK SC system font (install `fonts-noto-cjk` on Linux). Sharing images are checked in so production does not fetch fonts or regenerate claims.
4. Run `npm run lint`, `npm run test:content`, `npm run build`, and `npm run test:e2e`. Install a Chromium runtime with `npx playwright install --with-deps chromium` when needed. Builds consume checked-in content and images; there is no network data refresh in prebuild.
5. Review desktop/mobile layouts, keyboard navigation, both language paths, no-JavaScript fallback, example states and links. Run the mobile Lighthouse script against a production build for the homepage and flagship cases.

## GitHub and release

Keep the profile repository's English and Chinese READMEs consistent with the catalog. The website contains the deep walkthroughs; GitHub contains short introductions and source/case links. Pins are ordered LaunchLens, Playbook, AIW, Model Eval, RAG, Battery and must be checked separately from README publication.

Publish a branch preview using the repository's existing Vercel integration, inspect it, and then merge the verified commit to `main`. Check the production domain, canonical URLs, sitemap, both language sharing images, and profile links after deployment. Preserve the previous production SHA as the rollback target; use a revert commit or Vercel rollback rather than rewriting Git history.

The LaunchLens image is derived from the existing public screenshot at `https://raw.githubusercontent.com/Zhi-Chao-PAN/launchlens-ai/main/public/screenshots/launchlens-desktop.png`, resized to 1200 pixels and WebP encoded. It is a historical product screenshot, not a live view of a selected sample step.
