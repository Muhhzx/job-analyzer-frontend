import { randomUUID } from "node:crypto";
import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const PASSWORD = "senha-forte-123";
export const newEmail = () => `e2e-${randomUUID().slice(0, 8)}@teste.local`;

/** Cria a conta pela tela de cadastro e espera cair na área logada. */
export async function signUp(page: Page, email = newEmail(), name = "Pessoa Teste") {
  await page.goto("/cadastro");
  await page.getByLabel("Nome").fill(name);
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(PASSWORD);
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page).not.toHaveURL(/\/cadastro/);
  return email;
}

export async function logIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel("Senha").fill(password);
  await page.getByRole("button", { name: "Entrar" }).click();
}

const DESCRIPTION =
  "Desenvolvedor Angular e .NET para projeto com APIs REST, testes automatizados, CI/CD e SQL Server. ".repeat(2);

/** Cola uma vaga pela API (com o cookie da página) e devolve o id. */
export async function createJob(request: APIRequestContext, title: string, company: string) {
  const res = await request.post("/api/jobs", { data: { title, company, description: DESCRIPTION } });
  expect(res.ok()).toBeTruthy();
  return (await res.json()).job.id as number;
}
