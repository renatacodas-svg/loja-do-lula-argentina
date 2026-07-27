"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Validando o link de recuperação...");
  const [canReset, setCanReset] = useState(false);

  useEffect(() => {
    async function prepareSession() {
      const supabase = createClient();
      if (!supabase) {
        setMessage("A conexão com o serviço de acesso não está configurada.");
        setReady(true);
        return;
      }

      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(`O link não pôde ser validado: ${error.message}`);
          setReady(true);
          return;
        }
      } else if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        if (error) {
          setMessage(`O link não pôde ser validado: ${error.message}`);
          setReady(true);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMessage("Este link expirou ou já foi utilizado. Solicite uma nova recuperação no Admin.");
        setReady(true);
        return;
      }

      setCanReset(true);
      setMessage("");
      setReady(true);
    }

    void prepareSession();
  }, []);

  async function updatePassword(formData: FormData) {
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("password_confirmation") ?? "");
    if (password.length < 8) {
      setMessage("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirmation) {
      setMessage("As duas senhas não coincidem.");
      return;
    }

    const supabase = createClient();
    if (!supabase) return;
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(`Não foi possível atualizar a senha: ${error.message}`);
      return;
    }
    await supabase.auth.signOut();
    setCanReset(false);
    setMessage("Senha atualizada com sucesso. Agora você pode entrar no Admin.");
  }

  return (
    <section className="mx-auto max-w-md px-4 py-14">
      <h1 className="mb-5 text-3xl font-black">Redefinir senha</h1>
      <div className="grid gap-4 rounded-lg bg-white p-5 shadow-soft">
        {message ? <p className={`rounded-md p-3 text-sm font-bold ${message.includes("sucesso") ? "bg-green-50 text-green-800" : "bg-yellow-50 text-yellow-900"}`}>{message}</p> : null}
        {!ready ? <p className="text-sm font-bold text-zinc-600">Aguarde...</p> : null}
        {canReset ? (
          <form action={updatePassword} className="grid gap-4">
            <label className="grid gap-2 text-sm font-bold">Nova senha<input required minLength={8} name="password" type="password" className="focus-ring rounded-md border px-3 py-3" /></label>
            <label className="grid gap-2 text-sm font-bold">Repita a nova senha<input required minLength={8} name="password_confirmation" type="password" className="focus-ring rounded-md border px-3 py-3" /></label>
            <button className="focus-ring min-h-12 rounded-md bg-lulaRed font-black text-white">Salvar nova senha</button>
          </form>
        ) : null}
        {ready && !canReset ? <Link href="/admin" className="text-center text-sm font-black text-brasilBlue underline">Voltar ao Admin</Link> : null}
      </div>
    </section>
  );
}
