"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

type Options = { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown };

/**
 * Cache das respostas GET, guardado na memória da aba.
 * Ao voltar para uma tela, ela aparece na hora com o que já tinha e se atualiza por trás
 * ("stale-while-revalidate", a mesma ideia de bibliotecas como SWR e React Query).
 */
const cache = new Map<string, unknown>();
/** Requisições GET em andamento: duas telas pedindo o mesmo endereço compartilham uma só. */
const inflight = new Map<string, Promise<unknown>>();

/** Apaga tudo o que está em cache. Chamado no login e no logout (outro usuário pode entrar na mesma aba). */
export function clearApiCache() {
  cache.clear();
  inflight.clear();
}

async function request<T>(path: string, { method = "GET", body }: Options): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    credentials: "same-origin",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith("/auth/") && typeof window !== "undefined") {
      clearApiCache();
      window.location.href = "/login";
    }
    const message =
      (data as { error?: string }).error ??
      (res.status >= 500 ? "O servidor não respondeu. A API (backend) está rodando?" : "Algo deu errado.");
    throw new ApiError(res.status, message);
  }
  return data as T;
}

/** Chamada à API do backend (encaminhada pelo Next em /api). */
export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const method = options.method ?? "GET";

  if (method === "GET") {
    const running = inflight.get(path);
    if (running) return running as Promise<T>;
    const promise = request<T>(path, options)
      .then((data) => {
        cache.set(path, data);
        return data;
      })
      .finally(() => inflight.delete(path));
    inflight.set(path, promise);
    return promise;
  }

  const data = await request<T>(path, options);
  // Entrar ou sair muda de usuário: nada do cache anterior pode aparecer.
  if (path === "/auth/login" || path === "/auth/logout" || path === "/auth/register") clearApiCache();
  return data;
}

/**
 * Busca dados para uma tela.
 * - Se já houver cache, mostra na hora (sem esqueleto de carregamento) e atualiza por trás.
 * - Atualiza de novo quando você volta para a aba do navegador.
 * - `reload` força uma nova busca; `setData` troca os dados (e o cache) depois de uma ação.
 */
export function useApi<T>(path: string | null) {
  const cached = path ? (cache.get(path) as T | undefined) : undefined;
  const [data, setDataState] = useState<T | null>(cached ?? null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(path) && cached === undefined);
  const currentPath = useRef(path);
  currentPath.current = path;

  const reload = useCallback(async () => {
    if (!path) return;
    // Com cache, a busca acontece "em silêncio"; sem cache, mostra o carregamento.
    if (!cache.has(path)) setLoading(true);
    try {
      const fresh = await api<T>(path);
      if (currentPath.current === path) {
        setDataState(fresh);
        setError(null);
      }
    } catch (err) {
      if (currentPath.current === path) setError((err as Error).message);
    } finally {
      if (currentPath.current === path) setLoading(false);
    }
  }, [path]);

  // Ao trocar de endereço (ex.: outro filtro ou página), mostra o cache dele, se houver.
  useEffect(() => {
    if (!path) return;
    const hit = cache.get(path) as T | undefined;
    if (hit !== undefined) {
      setDataState(hit);
      setLoading(false);
    }
    void reload();
  }, [path, reload]);

  // Voltou para a aba: atualiza os dados.
  useEffect(() => {
    const onVisible = () => document.visibilityState === "visible" && void reload();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [reload]);

  const setData = useCallback(
    (value: T | null) => {
      setDataState(value);
      if (path && value !== null) cache.set(path, value);
    },
    [path],
  );

  return { data, error, loading, reload, setData };
}
