"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";

const packOptions = [
  "Pack Apoio 250K",
  "Pack Apoio 500K",
  "Pack Apoio 1 milhão",
  "Quero conversar sobre outro valor"
];

export function PackRequestForm() {
  const params = useSearchParams();
  const requestedPack = params.get("pack") ?? packOptions[0];
  const initialPack = packOptions.includes(requestedPack) ? requestedPack : packOptions[0];
  const [token, setToken] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(formData: FormData) {
    setState("saving");
    setMessage("");

    if (!token && process.env.NODE_ENV !== "development") {
      setState("error");
      setMessage("Conclua a verificação antispam antes de enviar.");
      return;
    }

    const payload = {
      responsible_name: String(formData.get("responsible_name") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? ""),
      email: String(formData.get("email") ?? ""),
      city: String(formData.get("city") ?? ""),
      amount_reference: String(formData.get("amount_reference") ?? ""),
      support_type: String(formData.get("support_type") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      status: "novo"
    };

    const response = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "pack_requests",
        payload,
        token,
        website: String(formData.get("website") ?? "")
      })
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({})) as { error?: string };
      setState("error");
      setMessage(result.error ?? "Não foi possível enviar o pedido. Confira os dados e tente novamente.");
      return;
    }

    setState("success");
    setMessage("Recebemos seu pedido de pack. A equipe da Loja do Lula entrará em contato para conversar sobre a melhor composição.");
  }

  if (state === "success") {
    return <div className="rounded-lg bg-green-50 p-6 text-lg font-bold leading-7 text-green-900">{message}</div>;
  }

  return (
    <form action={submit} className="grid gap-4 rounded-lg bg-white p-5 shadow-soft">
      {state === "error" ? <p className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{message}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">Nome da pessoa responsável<input required maxLength={120} name="responsible_name" className="focus-ring rounded-md border px-3 py-3" /></label>
        <label className="grid gap-2 text-sm font-bold">WhatsApp (opcional)<input maxLength={40} name="whatsapp" className="focus-ring rounded-md border px-3 py-3" /></label>
        <label className="grid gap-2 text-sm font-bold">E-mail<input required maxLength={254} type="email" name="email" className="focus-ring rounded-md border px-3 py-3" /></label>
        <label className="grid gap-2 text-sm font-bold">Cidade<input required maxLength={120} name="city" className="focus-ring rounded-md border px-3 py-3" /></label>
      </div>
      <label className="grid gap-2 text-sm font-bold">
        Pack de referência
        <select name="amount_reference" defaultValue={initialPack} className="focus-ring rounded-md border px-3 py-3">
          {packOptions.map((option) => <option key={option}>{option}</option>)}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold">
        O que você gostaria de organizar?
        <select name="support_type" className="focus-ring rounded-md border px-3 py-3">
          <option>materiais para atividades</option>
          <option>distribuição comunitária</option>
          <option>ações de mobilização</option>
          <option>combo para grupo</option>
          <option>conversar com a equipe</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold">Mensagem<textarea maxLength={2000} name="notes" rows={5} className="focus-ring rounded-md border px-3 py-3" /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0" />
      <label className="flex items-start gap-3 text-sm font-semibold"><input required type="checkbox" className="mt-1" /><span>Li a <Link href="/privacidade" target="_blank" className="font-black text-brasilBlue">política de privacidade</Link> e autorizo o uso dos dados para responder a este pedido.</span></label>
      <label className="flex items-start gap-3 text-sm font-semibold"><input required type="checkbox" className="mt-1" /><span>Entendo que este formulário inicia uma conversa e não confirma automaticamente uma compra ou contribuição.</span></label>
      <TurnstileWidget onToken={setToken} />
      <button disabled={state === "saving"} className="focus-ring min-h-12 rounded-md bg-lulaRed px-5 py-3 font-black text-white disabled:opacity-60">
        {state === "saving" ? "Enviando..." : "Pedir pack"}
      </button>
    </form>
  );
}
