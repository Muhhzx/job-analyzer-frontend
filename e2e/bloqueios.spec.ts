import { expect, test } from "@playwright/test";
import { createJob, signUp } from "./helpers";

test("ligar um filtro de bloqueio esconde a vaga e mostra o motivo", async ({ page }) => {
  await signUp(page);
  const base = "Angular and C# developer for banking APIs, automated tests and CI/CD pipelines. ";
  // Vaga com o texto que dispara o bloqueio de residência.
  const res = await page.request.post("/api/jobs", {
    data: { title: "Developer Auckland", company: "Kiwi Bank", description: base + "You must be a permanent resident." },
  });
  const blockedId = (await res.json()).job.id as number;
  await createJob(page.request, "Desenvolvedor Angular", "Banco BR");

  await page.goto("/vagas");
  await expect(page.getByText("Developer Auckland")).toBeVisible();

  // Liga o bloqueio pronto pela tela de perfil.
  await page.goto("/perfil#bloqueios");
  await page.getByLabel("Exige residência, cidadania ou visto que não tenho").check();
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByText("Perfil salvo")).toBeVisible();

  await page.goto("/vagas");
  await expect(page.getByText("Desenvolvedor Angular")).toBeVisible();
  await expect(page.getByText("Developer Auckland")).toHaveCount(0);

  await page.getByRole("button", { name: /Bloqueadas/ }).click();
  await expect(page.getByText("Developer Auckland")).toBeVisible();

  await page.goto(`/vagas/${blockedId}`);
  await expect(page.getByText("Escondida pelos seus filtros de bloqueio.")).toBeVisible();
  await expect(page.getByText(/permanent resident/)).toBeVisible();
});
