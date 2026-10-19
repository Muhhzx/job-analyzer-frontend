"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

type AuthContext = { user: User | null; loading: boolean; logout: () => Promise<void> };

const Ctx = createContext<AuthContext>({ user: null, loading: true, logout: async () => {} });

export const useAuth = () => useContext(Ctx);

/** Garante que o usuário está logado; se não, manda para o login. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ user: User }>("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" });
    router.replace("/login");
  }, [router]);

  return <Ctx.Provider value={{ user, loading, logout }}>{children}</Ctx.Provider>;
}
