"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      await api("/auth/register", {
        method: "POST",
        body: { name: fd.get("name"), email: fd.get("email"), password: fd.get("password") },
      });
      router.replace("/perfil?boas-vindas=1");
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Crie sua conta" subtitle="Leva menos de um minuto. Depois é só montar seu perfil.">
      <form onSubmit={submit} className="flex flex-col gap-4">
        <Field label="Nome" htmlFor="name">
          <Input id="name" name="name" required autoComplete="name" placeholder="Como quer ser chamado" />
        </Field>
        <Field label="E-mail" htmlFor="email">
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="voce@email.com" />
        </Field>
        <Field label="Senha" htmlFor="password" hint="Mínimo de 8 caracteres.">
          <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <Button type="submit" size="lg" loading={loading} className="mt-2 w-full">
          Criar conta
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
