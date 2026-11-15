import os from "node:os";
import path from "node:path";
import { defineConfig } from "@playwright/test";

/**
 * Testes de ponta a ponta: sobem um backend e um frontend só para os testes,
 * em portas próprias e com banco temporário. Não usam o `npm run dev` (3000/4000)
 * nem o banco de verdade, e a IA fica desligada (nenhum teste gasta cota).
 * Usam o Microsoft Edge já instalado no Windows (nada de baixar navegador).
 */
const API_PORT = 4120;
const WEB_PORT = 3120;
const DB = path.join(os.tmpdir(), `job-analyzer-e2e-${Date.now()}.db`);

export default defineConfig({
  testDir: "e2e",
  // O Next em modo dev compila cada página no primeiro acesso: aquece antes de começar.
  globalSetup: "./e2e/warmup.ts",
  timeout: 60_000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    channel: "msedge",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "npx tsx src/server.ts",
      cwd: "../job-analyzer-backend",
      url: `http://127.0.0.1:${API_PORT}/api/health`,
      env: {
        PORT: String(API_PORT),
        DATABASE_PATH: DB,
        ANTHROPIC_API_KEY: "",
        ANTHROPIC_AUTH_TOKEN: "",
        // A suíte cria uma conta por teste, todas do mesmo IP (127.0.0.1).
        REGISTER_LIMIT_PER_IP: "1000",
      },
      reuseExistingServer: false,
      timeout: 60_000,
    },
    {
      command: `npx next dev -p ${WEB_PORT}`,
      url: `http://localhost:${WEB_PORT}/login`,
      env: { API_URL: `http://127.0.0.1:${API_PORT}`, NEXT_DIST_DIR: ".next-e2e" },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
