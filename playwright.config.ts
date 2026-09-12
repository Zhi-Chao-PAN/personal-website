import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  workers: 2,
  reporter: [
    ["list"],
    ["json", { outputFile: "../qa/playwright-results.json" }],
  ],
  outputDir: "../qa/test-results",
  use: { baseURL: "http://127.0.0.1:3007", trace: "retain-on-failure" },
  projects: [
    {
      name: "desktop",
      use: { browserName: "chromium", viewport: { width: 1440, height: 1000 } },
    },
    {
      name: "mobile",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "npm run start -- --port 3007",
    url: "http://127.0.0.1:3007",
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
});
