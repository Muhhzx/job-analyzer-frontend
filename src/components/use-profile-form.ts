"use client";

import { useEffect, useMemo, useState } from "react";
import { api, useApi } from "@/lib/api";
import type { BlockPreset, Completion, Profile } from "@/lib/types";
import { useToast } from "./ui/toast";

type ProfileResponse = { profile: Profile; completion: Completion; blockPresets: BlockPreset[] };

/** Estado do formulário de perfil: carrega, acompanha mudanças e salva. */
export function useProfileForm() {
  const toast = useToast();
  const { data, loading, setData } = useApi<ProfileResponse>("/profile");
  const [form, setForm] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data.profile);
  }, [data]);

  const dirty = useMemo(() => {
    if (!form || !data) return false;
    return (Object.keys(form) as (keyof Profile)[]).some((k) => form[k] !== data.profile[k]);
  }, [form, data]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setForm((f) => (f ? { ...f, [key]: value } : f));

  const save = async (successMessage = "Perfil salvo") => {
    if (!form || !data) return;
    const changes = Object.fromEntries(
      (Object.keys(form) as (keyof Profile)[])
        .filter((k) => k !== "last_auto_run" && form[k] !== data.profile[k])
        .map((k) => [k, form[k]]),
    );
    setSaving(true);
    try {
      setData(await api<ProfileResponse>("/profile", { method: "PUT", body: changes }));
      toast.success(successMessage);
    } catch (err) {
      toast.error("Não foi possível salvar", (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const reset = () => data && setForm(data.profile);

  return {
    form,
    completion: data?.completion,
    blockPresets: data?.blockPresets ?? [],
    loading,
    set,
    save,
    saving,
    dirty,
    reset,
  };
}
