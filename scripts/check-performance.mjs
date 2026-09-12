#!/usr/bin/env node
// Run against a production build. Reports stay outside the repository.
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const targets = { performance: 90, accessibility: 95, seo: 95 };
const categories = Object.keys(targets);
const pages = [
  { name: 'home', path: '/' },
  { name: 'launchlens-ai', path: '/projects/launchlens-ai' },
  { name: 'llm-evaluation-playbook', path: '/projects/llm-evaluation-playbook' },
  { name: 'ai-cli-orchestrator', path: '/projects/ai-cli-orchestrator' },
];
const runsPerPage = 3;
const runTimeoutMs = 120_000;

export function median(values) {
  if (values.length !== runsPerPage || values.some(value => !Number.isFinite(value))) return null;
  return [...values].sort((a, b) => a - b)[1];
}

function failedAudits(lhr) {
  return Object.fromEntries(categories.map(category => [category,
    (lhr.categories?.[category]?.auditRefs ?? []).flatMap(({ id }) => {
      const audit = lhr.audits?.[id];
      if (!audit || !(typeof audit.score === 'number' && audit.score < 1 || audit.scoreDisplayMode === 'error')) return [];
      return [{ id, title: audit.title, score: audit.score, displayValue: audit.displayValue ?? '',
        explanation: audit.explanation ?? audit.errorMessage ?? '',
        locations: [...new Set((audit.details?.items ?? []).flatMap(item => [item.node?.selector, item.url]).filter(Boolean))].slice(0, 5),
      }];
    }),
  ]));
}

export function summarizePage(page, runs) {
  const medians = Object.fromEntries(categories.map(category => [category, median(runs.map(run => run.scores?.[category]))]));
  const failedCategories = categories.filter(category => medians[category] === null || medians[category] < targets[category]);
  const audits = [];
  for (const category of failedCategories) {
    const byId = new Map();
    for (const run of runs) {
      for (const audit of run.failedAudits?.[category] ?? []) {
        if (!byId.has(audit.id)) byId.set(audit.id, { ...audit, category, failedRuns: [], displayValues: [], locations: [] });
        const entry = byId.get(audit.id);
        entry.failedRuns.push(run.run);
        if (audit.displayValue) entry.displayValues.push(audit.displayValue);
        entry.locations.push(...audit.locations);
      }
    }
    audits.push(...[...byId.values()].map(audit => ({ ...audit, displayValues: [...new Set(audit.displayValues)], locations: [...new Set(audit.locations)] })));
  }
  return { ...page, medians, failedCategories, passed: runs.length === runsPerPage && runs.every(run => !run.error) && failedCategories.length === 0, failedAudits: audits, runs };
}

const displayScore = value => value === null || value === undefined ? 'unavailable' : Number(value.toFixed(2)).toString();

function summaryMarkdown(summary) {
  const lines = [
    '# Mobile Lighthouse results', '',
    `Base URL: ${summary.baseUrl}`, `Started: ${summary.startedAt}`, `Finished: ${summary.finishedAt}`,
    'Method: three sequential runs per page, a fresh headless Chrome profile for every run, Lighthouse default mobile emulation and simulated throttling.',
    `Required median scores: performance ${targets.performance}, accessibility ${targets.accessibility}, SEO ${targets.seo}.`,
    `Result: ${summary.passed ? 'PASS' : 'FAIL'}. A missing score or run error prevents a pass.`, '',
    '| Page | Performance | Accessibility | SEO | Result |', '| --- | ---: | ---: | ---: | --- |',
    ...summary.pages.map(page => `| ${page.path} | ${displayScore(page.medians.performance)} | ${displayScore(page.medians.accessibility)} | ${displayScore(page.medians.seo)} | ${page.passed ? 'PASS' : 'FAIL'} |`), '',
  ];
  for (const page of summary.pages) {
    lines.push(`## ${page.name}`, '');
    for (const run of page.runs) {
      if (run.json && run.html) lines.push(`- Run ${run.run}: [JSON](${run.json}) · [HTML](${run.html})${run.error ? ` — ERROR: ${run.error}` : ''}`);
      else lines.push(`- Run ${run.run}: ERROR — ${run.error ?? 'No report returned'}`);
    }
    for (const audit of page.failedAudits) lines.push(`- ${audit.category} / ${audit.id}: ${audit.title}${audit.displayValues.length ? ` — ${audit.displayValues.join('; ')}` : ''} (runs ${audit.failedRuns.join(', ')})`);
    lines.push('');
  }
  lines.push('Scores describe these pages in the tested environment; they do not replace keyboard, content, or live-deployment checks.', '');
  return lines.join('\n');
}

async function withDeadline(promise) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`Lighthouse exceeded ${runTimeoutMs / 1000}s`)), runTimeoutMs); })]);
  } finally { clearTimeout(timer); }
}

async function main() {
  if (process.argv.includes('--help')) {
    console.log('Usage: CHROME_PATH=/path/to/linux/chrome [BASE_URL=http://127.0.0.1:3007] node scripts/check-performance.mjs\nRuns 4 pages × 3 mobile audits. Reports: ../qa/lighthouse/<timestamp>/. Thresholds: performance 90, accessibility 95, SEO 95.');
    return;
  }
  if (process.argv.length > 2) throw new Error('Unexpected arguments. Use --help for the environment-based interface.');
  if (process.platform !== 'linux') throw new Error('Run this script on Linux with a Linux Chrome binary.');
  if (!process.env.CHROME_PATH) throw new Error('Set CHROME_PATH to the intended Linux Chrome executable.');
  const chromePath = resolve(process.env.CHROME_PATH);
  await access(chromePath, constants.X_OK);
  const base = new URL(process.env.BASE_URL ?? 'http://127.0.0.1:3007');
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash || base.pathname !== '/') {
    throw new Error('BASE_URL must be an HTTP(S) origin without credentials, a path prefix, query, or fragment.');
  }
  const probe = await fetch(base, { signal: AbortSignal.timeout(10_000) });
  await probe.body?.cancel();
  if (!probe.ok) throw new Error(`The homepage is not ready: HTTP ${probe.status}. Start the production server before running this check.`);

  const [{ default: lighthouse }, chromeLauncher] = await Promise.all([import('lighthouse'), import('chrome-launcher')]);
  const startedAt = new Date().toISOString();
  const outputDir = fileURLToPath(new URL(`../../qa/lighthouse/${startedAt.replace(/[:.]/g, '-')}/`, import.meta.url));
  await mkdir(outputDir, { recursive: true });
  const summary = { baseUrl: base.origin, startedAt, finishedAt: null, targets, runsPerPage, formFactor: 'mobile', throttlingMethod: 'simulate', passed: false, pages: [] };
  let activeChrome;
  let closingChrome;
  let interrupted = false;
  let signalExitCode = 0;
  const closeChrome = async () => {
    if (activeChrome) {
      const chrome = activeChrome;
      activeChrome = undefined;
      closingChrome = chrome.kill();
    }
    const pending = closingChrome;
    if (pending) {
      try { await pending; } finally { if (closingChrome === pending) closingChrome = undefined; }
    }
  };
  const interrupt = signal => {
    interrupted = true;
    signalExitCode = signal === 'SIGINT' ? 130 : 143;
    void closeChrome().catch(error => console.error(`Chrome cleanup: ${error.message}`));
  };
  const onSigint = () => interrupt('SIGINT');
  const onSigterm = () => interrupt('SIGTERM');
  process.once('SIGINT', onSigint);
  process.once('SIGTERM', onSigterm);
  console.log(`Mobile Lighthouse reports: ${outputDir}`);
  try {
    for (const page of pages) {
      const runs = [];
      for (let run = 1; run <= runsPerPage && !interrupted; run += 1) {
        const url = new URL(page.path, base).href;
        const record = { run, url, scores: {}, error: null, failedAudits: {} };
        const prefix = `${page.name}-${run}`;
        const userDataDir = await mkdtemp(resolve(outputDir, `browser-profile-${prefix}-`));
        console.log(`[${page.name}] run ${run}/${runsPerPage} · ${url}`);
        try {
          closingChrome = undefined;
          activeChrome = await chromeLauncher.launch({ chromePath, userDataDir, chromeFlags: ['--headless', '--no-sandbox', '--disable-dev-shm-usage'], handleSIGINT: false, logLevel: 'error', connectionPollInterval: 250, maxConnectionRetries: 80 });
          if (interrupted) throw new Error('Interrupted before the audit started.');
          const result = await withDeadline(lighthouse(url, { port: activeChrome.port, logLevel: 'error', output: ['json', 'html'], onlyCategories: categories, formFactor: 'mobile', throttlingMethod: 'simulate', disableStorageReset: false, locale: 'en-US' }));
          if (!result?.lhr || !Array.isArray(result.report) || result.report.length !== 2) throw new Error('Lighthouse did not return both JSON and HTML reports.');
          record.json = `${prefix}.json`;
          record.html = `${prefix}.html`;
          await Promise.all([writeFile(resolve(outputDir, record.json), result.report[0]), writeFile(resolve(outputDir, record.html), result.report[1])]);
          record.lighthouseVersion = result.lhr.lighthouseVersion;
          record.fetchTime = result.lhr.fetchTime;
          record.finalUrl = result.lhr.finalDisplayedUrl ?? result.lhr.finalUrl;
          record.scores = Object.fromEntries(categories.map(category => [category, typeof result.lhr.categories?.[category]?.score === 'number' ? result.lhr.categories[category].score * 100 : null]));
          record.failedAudits = failedAudits(result.lhr);
          record.runWarnings = result.lhr.runWarnings ?? [];
          if (result.lhr.runtimeError) record.error = `${result.lhr.runtimeError.code}: ${result.lhr.runtimeError.message}`;
        } catch (error) {
          record.error = error.message;
          await writeFile(resolve(outputDir, `${prefix}.error.json`), JSON.stringify({ url, run, error: record.error, recordedAt: new Date().toISOString() }, null, 2) + '\n');
        } finally {
          try { await closeChrome(); } catch (error) { record.error = [record.error, `Chrome cleanup failed: ${error.message}`].filter(Boolean).join('; '); }
          await rm(userDataDir, { recursive: true, force: true });
        }
        runs.push(record);
        console.log(record.error ? `  ERROR: ${record.error}` : `  performance ${displayScore(record.scores.performance)} · accessibility ${displayScore(record.scores.accessibility)} · SEO ${displayScore(record.scores.seo)}`);
      }
      summary.pages.push(summarizePage(page, runs));
    }
  } finally {
    try { await closeChrome(); } finally {
      process.removeListener('SIGINT', onSigint);
      process.removeListener('SIGTERM', onSigterm);
    }
  }
  summary.finishedAt = new Date().toISOString();
  summary.passed = !interrupted && summary.pages.length === pages.length && summary.pages.every(page => page.passed);
  await Promise.all([writeFile(resolve(outputDir, 'summary.json'), JSON.stringify(summary, null, 2) + '\n'), writeFile(resolve(outputDir, 'summary.md'), summaryMarkdown(summary))]);
  console.log('\nThree-run medians (performance / accessibility / SEO):');
  for (const page of summary.pages) {
    console.log(`${page.passed ? 'PASS' : 'FAIL'} ${page.path}: ${categories.map(category => displayScore(page.medians[category])).join(' / ')}`);
    for (const audit of page.failedAudits) {
      console.log(`  ${audit.category} / ${audit.id}: ${audit.title}${audit.displayValues.length ? ` — ${audit.displayValues.join('; ')}` : ''} [runs ${audit.failedRuns.join(', ')}]`);
      if (audit.explanation) console.log(`    ${audit.explanation}`);
      for (const location of audit.locations) console.log(`    ${location}`);
    }
  }
  console.log(`Summary: ${resolve(outputDir, 'summary.json')}`);
  process.exitCode = signalExitCode || (summary.passed ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch(error => { console.error(`Performance check failed: ${error.message}`); process.exitCode = 1; });
}
