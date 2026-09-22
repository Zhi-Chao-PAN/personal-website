# ZhiChao Pan — Personal Lab

A bilingual portfolio about product-led, AI-assisted engineering: building useful products, defining evaluation criteria, and giving agent tools deliberate execution boundaries.

[English website](https://www.panzhichao.com) · [中文网站](https://www.panzhichao.com/zh) · [GitHub profile](https://github.com/Zhi-Chao-PAN)

## Explore

- **LaunchLens AI:** product decisions, recorded evidence and an editable workflow.
- **LLM Evaluation Playbook:** task specifications, rubric methods and numerical checks.
- **AI CLI Orchestrator:** explicit routing, bounded execution and reviewable outcomes.

The site includes 14 cases, including one public application-evidence case and public overviews of four private projects. The three flagship walkthroughs use public examples and fixed data; viewing them requires no account or paid model call.

## Development

```sh
npm ci
npm run dev
```

Next.js 16, React 19, TypeScript and CSS. Production remains on the existing Vercel project. English and Chinese pages are statically generated; the legacy sharing-image endpoint redirects to a local image.

## Checks

```sh
npm run lint
npm run test:content
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

Builds use reviewed, checked-in content. Metadata refresh and sharing-image generation are explicit commands, never automatic prebuild mutations.

See [content evidence](docs/content-evidence.md) for sources and their limits, and [maintenance instructions](docs/maintaining-the-portfolio.md) for adding projects, regenerating sharing images and publishing changes.
