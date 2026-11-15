/**
 * Abre cada página uma vez antes dos testes. Sem isso, o primeiro teste que visita uma página
 * espera o Next compilar (às vezes mais de 10 s) e falha por tempo, não por erro de verdade.
 */
export default async function warmup() {
  const base = "http://localhost:3120";
  for (const path of ["/login", "/cadastro", "/painel", "/vagas", "/vagas/1", "/candidaturas", "/perfil"]) {
    await fetch(base + path).catch(() => undefined);
  }
  await fetch(base + "/api/health").catch(() => undefined);
}
