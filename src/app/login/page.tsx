"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      await api("/auth/login", { method: "POST", body: { email: fd.get("email"), password: fd.get("password") } });
      router.replace("/painel");
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Bem-vindo de volta" subtitle="Entre para ver suas vagas e análises.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="E-mail" htmlFor="email">
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="voce@email.com" />
        </Field>
        <Field label="Senha" htmlFor="password">
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </Field>
        {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          Entrar
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-medium text-primary hover:underline">
          Crie grátis
        </Link>
      </p>
    </AuthLayout>
  );
}
