import { defineConfig } from "@playwright/test"
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  reporter: [
    ["list"],
    ["html", { outputFolder: "output/browser-report", open: "never" }],
  ],
  use: {
    baseURL: "http://127.0.0.1:5199",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "node tests/serve.mjs",
    url: "http://127.0.0.1:5199/api/health",
    reuseExistingServer: false,
    timeout: 60000,
  },
})
