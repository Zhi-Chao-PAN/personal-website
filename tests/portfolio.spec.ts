import { test, expect } from "@playwright/test";
import data from "../data/portfolio.json";
for (const locale of ["en", "zh"] as const) {
  const home = locale === "en" ? "/" : "/zh";
  test(`${locale}: every case renders with canonical and paired language`, async ({
    request,
  }) => {
    for (const p of data.projects) {
      const path = `${locale === "zh" ? "/zh" : ""}/projects/${p.slug}`;
      const response = await request.get(path);
      expect(response.status(), path).toBe(200);
      const html = await response.text();
      expect(html).toContain(
        `<html lang="${locale === "zh" ? "zh-CN" : "en"}"`,
      );
      expect(html).toContain(`href="https://www.panzhichao.com${path}"`);
      expect(html).toContain(
        `href="https://www.panzhichao.com/zh/projects/${p.slug}"`,
      );
      expect(html).toContain('id="role"');
      expect(html).toContain('id="evidence"');
    }
  });
  test(`${locale}: homepage has usable work links and no overflow`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(home);
    await expect(page.locator("h1")).toContainText("ZhiChao");
    await expect(page.locator("#work")).toBeVisible();
    await expect(page.locator(".index-row")).toHaveCount(10);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator(".feature-item h3 a").first().click();
    await expect(page).toHaveURL(/projects\/launchlens-ai$/);
    await page.locator(".language-link").click();
    await expect(page).toHaveURL(
      locale === "en"
        ? /\/zh\/projects\/launchlens-ai$/
        : /3007\/projects\/launchlens-ai$/,
    );
    expect(errors).toEqual([]);
  });
  test(`${locale}: samples expose truthful, interactive outcomes`, async ({
    page,
  }) => {
    const prefix = locale === "zh" ? "/zh" : "";
    await page.goto(`${prefix}/projects/launchlens-ai`);
    for (const step of ["brief", "evidence", "decision", "next"]) {
      await page.getByTestId(`launchlens-step-${step}`).click();
      await expect(page.getByTestId(`launchlens-step-${step}`)).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    }
    await page.goto(`${prefix}/projects/llm-evaluation-playbook`);
    await page.getByTestId("playbook-view-answer").click();
    await expect(page.getByTestId("playbook-reference-mrr")).toContainText(
      "4,817,500",
    );
    await page.getByTestId("playbook-view-judging").click();
    for (const [value, result] of [
      ["4721150", "pass"],
      ["4913850", "pass"],
      ["4721149", "fail"],
      ["4913851", "fail"],
      ["", "invalid"],
    ]) {
      await page.getByTestId("playbook-mrr-input").fill(value);
      await expect(page.getByTestId("playbook-mrr-result")).toHaveAttribute(
        "data-result",
        result,
      );
    }
    await page.getByTestId("playbook-answer-pass").click();
    await expect(page.getByTestId("playbook-mrr-result")).toHaveAttribute(
      "data-result",
      "pass",
    );
    await page.getByTestId("playbook-answer-fail").click();
    await expect(page.getByTestId("playbook-mrr-result")).toHaveAttribute(
      "data-result",
      "fail",
    );
    await page.goto(`${prefix}/projects/ai-cli-orchestrator`);
    for (const scenario of ["success", "capability", "timeout"]) {
      await page.getByTestId(`aiw-scenario-${scenario}`).click();
      await expect(page.getByTestId("aiw-flow")).toHaveAttribute(
        "data-scenario",
        scenario,
      );
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
test("content survives disabled JavaScript and blocked storage", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3007/");
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator(".feature-item h3 a")).toHaveCount(3);
  await page.locator(".feature-item h3 a").first().click();
  await expect(page.locator("#problem")).toBeVisible();
  await context.close();
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  await ctx.addInitScript(() => {
    for (const key of ["sessionStorage", "localStorage"])
      Object.defineProperty(window, key, {
        get() {
          throw new Error("Storage unavailable");
        },
      });
  });
  const pg = await ctx.newPage();
  const errors: string[] = [];
  pg.on("pageerror", (e) => errors.push(e.message));
  await pg.goto("http://127.0.0.1:3007/zh");
  await expect(pg.locator("h1")).toBeVisible();
  await pg.keyboard.press("Tab");
  await expect(pg.locator(".skip-link")).toBeFocused();
  expect(errors).toEqual([]);
  await ctx.close();
});
test("not found, sitemap and sharing images work", async ({ request }) => {
  expect((await request.get("/projects/not-a-project")).status()).toBe(404);
  expect((await request.get("/zh/projects/not-a-project")).status()).toBe(404);
  const map = await (await request.get("/sitemap.xml")).text();
  expect((map.match(/<loc>/g) || []).length).toBe(28);
  for (const slug of [
    "home",
    "launchlens-ai",
    "llm-evaluation-playbook",
    "ai-cli-orchestrator",
  ]) {
    const r = await request.get(`/api/og/${slug}`);
    expect(r.status()).toBe(200);
    expect(r.headers()["content-type"]).toContain("image/png");
  }
  expect((await request.get("/api/og/no-such-case")).status()).toBe(404);
});
