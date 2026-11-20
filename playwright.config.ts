import { defineConfig } from "@playwright/test";

const worker = process.env.TEST_WORKER === "1";
const port = worker ? 8787 : 3128;
// OpenNext enables unbuffered Suspense streaming for localhost in Wrangler dev.
const baseURL = `http://${worker ? "localhost" : "127.0.0.1"}:${port}`;

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    viewport: { width: 1612, height: 1139 },
    launchOptions: { executablePath: process.env.CHROMIUM_PATH },
  },
  webServer: {
    command: worker
      ? `bun run preview:worker --port ${port} --ip 127.0.0.1`
      : `bun run start --port ${port} --hostname 127.0.0.1`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
