import { expect, test } from "@playwright/test";
import { createJob, signUp } from "./helpers";

test.describe("quadro de candidaturas", () => {
  test.beforeEach(async ({ page }) => {
    await signUp(page);
  });

  test("quadro vazio explica o que fazer", async ({ page }) => {
    await page.goto("/candidaturas");
    await expect(page.getByText("Seu quadro está vazio")).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver vagas" })).toBeVisible();
  });

  test("“Me candidatei” na vaga coloca no quadro e o formulário salva", async ({ page }) => {
    const id = await createJob(page.request, "Desenvolvedor .NET Júnior", "GFT");
    await page.goto(`/vagas/${id}`);
    await page.getByRole("button", { name: "Me candidatei" }).click();
    await expect(page.getByRole("heading", { name: "Minha candidatura" })).toBeVisible();

    // O formulário da candidatura (a página também tem o botão "Salvar" da vaga).
    const form = page.locator("form").filter({ has: page.getByLabel("CV usado") });
    await form.getByLabel("CV usado").fill("CV GFT .NET");
    await form.getByLabel("Pretensão informada").fill("R$ 6.000 CLT");
    await form.getByLabel("Contato").fill("Mauro Camargo (LinkedIn)");
    await form.getByLabel("Anotações").fill("Mandei o CV para o Mauro");
    await form.getByRole("button", { name: "Salvar", exact: true }).click();
    await expect(page.getByText("Candidatura salva")).toBeVisible();

    await page.goto("/candidaturas");
    const column = page.getByRole("region", { name: "Candidatei" });
    await expect(column.getByText("Desenvolvedor .NET Júnior")).toBeVisible();
    await expect(column.getByText("CV GFT .NET")).toBeVisible();
  });

  test("arrastar o cartão muda a etapa e continua lá depois de recarregar", async ({ page }) => {
    const id = await createJob(page.request, "IT Analyst II Angular", "Santander");
    await page.request.patch(`/api/jobs/${id}`, { data: { status: "candidatado" } });

    await page.goto("/candidaturas");
    const card = page.getByRole("button", { name: /IT Analyst II Angular/ });
    await card.dragTo(page.getByRole("region", { name: "Entrevista" }));
    await expect(page.getByRole("region", { name: "Entrevista" }).getByText("IT Analyst II Angular")).toBeVisible();

    await page.reload();
    await expect(page.getByRole("region", { name: "Entrevista" }).getByText("IT Analyst II Angular")).toBeVisible();
    await expect(page.getByText("Teste ou entrevista").locator("..").getByText("1")).toBeVisible();
  });

  test("abrir o cartão, trocar a etapa pelo formulário e ver o histórico na vaga", async ({ page }) => {
    const id = await createJob(page.request, "Frontend Developer", "Henry Schein");
    await page.request.patch(`/api/jobs/${id}`, { data: { status: "salva" } });

    await page.goto("/candidaturas");
    await page.getByRole("button", { name: /Frontend Developer/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByLabel("Etapa").selectOption("teste");
    await dialog.getByRole("button", { name: "Salvar", exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("region", { name: "Teste" }).getByText("Frontend Developer")).toBeVisible();

    await page.goto(`/vagas/${id}`);
    const history = page.getByText("Histórico").locator("..");
    await expect(history.getByText("Salva")).toBeVisible();
    await expect(history.getByText("Teste")).toBeVisible();
  });

  test("tirar do quadro pede confirmação e remove o cartão", async ({ page }) => {
    const id = await createJob(page.request, "Vaga para remover", "Empresa Y");
    await page.request.patch(`/api/jobs/${id}`, { data: { status: "salva" } });

    await page.goto("/candidaturas");
    await page.getByRole("button", { name: /Vaga para remover/ }).click();
    page.once("dialog", (d) => void d.accept());
    await page.getByRole("button", { name: "Tirar do quadro" }).click();
    await expect(page.getByText("Seu quadro está vazio")).toBeVisible();
  });
});
