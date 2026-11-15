import { expect, test } from "@playwright/test";
import { createJob, logIn, newEmail, signUp } from "./helpers";

test.describe("login e sessão", () => {
  test("cria conta, sai e entra de novo", async ({ page }) => {
    const email = await signUp(page);
    await expect(page.getByText(email)).toBeVisible();

    await page.getByRole("button", { name: "Sair" }).first().click();
    await expect(page).toHaveURL(/\/login/);

    await logIn(page, email);
    await expect(page).toHaveURL(/\/painel/);
  });

  test("senha errada mostra erro genérico e não entra", async ({ page }) => {
    const email = await signUp(page);
    await page.context().clearCookies();

    await logIn(page, email, "senha-errada-123");
    await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);

    // E-mail que não existe dá exatamente a mesma mensagem (não revela quem tem conta).
    await logIn(page, newEmail(), "senha-errada-123");
    await expect(page.getByText("E-mail ou senha incorretos.")).toBeVisible();
  });

  test("área logada sem sessão manda para o login", async ({ page }) => {
    for (const path of ["/painel", "/vagas", "/candidaturas", "/perfil"]) {
      await page.goto(path);
      await expect(page, path).toHaveURL(/\/login/);
    }
  });

  test("o cookie de sessão não é acessível por JavaScript", async ({ page }) => {
    await signUp(page);
    expect(await page.evaluate(() => document.cookie)).not.toContain("ja_session");
    const cookie = (await page.context().cookies()).find((c) => c.name === "ja_session");
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe("Lax");
  });

  test("depois de sair, voltar no navegador não mostra dados", async ({ page }) => {
    await signUp(page);
    await createJob(page.request, "Vaga que não pode vazar", "Empresa Privada");
    await page.goto("/vagas?filter=todas");
    await expect(page.getByText("Vaga que não pode vazar")).toBeVisible();

    await page.getByRole("button", { name: "Sair" }).first().click();
    await expect(page).toHaveURL(/\/login/);
    expect((await page.request.get("/api/jobs")).status()).toBe(401);
    await page.goto("/vagas?filter=todas");
    await expect(page).toHaveURL(/\/login/);
  });

  test("páginas trazem cabeçalhos de segurança", async ({ page }) => {
    const res = await page.goto("/login");
    const headers = res!.headers();
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  });
});

test("uma pessoa não vê nem mexe nos dados de outra", async ({ browser }) => {
  // Dois navegadores separados (cookies separados), como duas pessoas diferentes.
  const ana = await (await browser.newContext()).newPage();
  const bruno = await (await browser.newContext()).newPage();

  await signUp(ana, newEmail(), "Ana");
  const jobId = await createJob(ana.request, "Vaga secreta da Ana", "Empresa da Ana");
  await ana.request.patch(`/api/applications/${jobId}`, { data: { stage: "entrevista", notes: "nota privada" } });

  await signUp(bruno, newEmail(), "Bruno");
  await bruno.goto("/candidaturas");
  await expect(bruno.getByText("Seu quadro está vazio")).toBeVisible();
  await expect(bruno.getByText("Vaga secreta da Ana")).toHaveCount(0);

  await bruno.goto(`/vagas/${jobId}`);
  await expect(bruno.getByRole("heading", { name: "Vaga não encontrada" })).toBeVisible();

  expect((await bruno.request.patch(`/api/applications/${jobId}`, { data: { stage: "encerrada" } })).status()).toBe(404);
  expect((await bruno.request.delete(`/api/jobs/${jobId}`)).status()).toBe(404);

  // Para a Ana, nada mudou.
  await ana.goto("/candidaturas");
  await expect(ana.getByText("Vaga secreta da Ana")).toBeVisible();
});
