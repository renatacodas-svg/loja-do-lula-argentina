"use client";

import Link from "next/link";
import { useState } from "react";
import { TurnstileWidget } from "@/components/turnstile-widget";

export function SalesPointRequestForm() {
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
      name: String(formData.get("name") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? ""),
      email: String(formData.get("email") ?? ""),
      city: String(formData.get("city") ?? ""),
      province: String(formData.get("province") ?? ""),
      group_reference: String(formData.get("group_reference") ?? ""),
      support_mode: String(formData.get("support_mode") ?? ""),
      can_coordinate_delivery: String(formData.get("can_coordinate_delivery") ?? ""),
      can_coordinate_orders_payments: String(formData.get("can_coordinate_orders_payments") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      status: "novo"
    };

    const response = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "sales_point_requests",
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
    setMessage("Recebemos seu interesse. A equipe da Loja do Lula entrará em contato para conversar sobre o ponto de venda.");
  }

  if (state === "success") {
    return <div className="rounded-lg bg-green-50 p-6 text-lg font-bold leading-7 text-green-900">{message}</div>;
  }

  return (
    <form action={submit} className="grid gap-4 rounded-lg bg-white p-5 shadow-soft">
      {state === "error" ? <p className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{message}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">Nome<input required maxLength={120} name="name" className="focus-ring rounded-md border px-3 py-3" /></label>
        <label className="grid gap-2 text-sm font-bold">WhatsApp<input required maxLength={40} name="whatsapp" className="focus-ring rounded-md border px-3 py-3" /></label>
        <label className="grid gap-2 text-sm font-bold">E-mail<input required maxLength={254} type="email" name="email" className="focus-ring rounded-md border px-3 py-3" /></label>
        <label className="grid gap-2 text-sm font-bold">Cidade<input required maxLength={120} name="city" className="focus-ring rounded-md border px-3 py-3" /></label>
        <label className="grid gap-2 text-sm font-bold">Província<input required maxLength={120} name="province" className="focus-ring rounded-md border px-3 py-3" /></label>
        <label className="grid gap-2 text-sm font-bold">Grupo, organização ou rede de referência<input maxLength={180} name="group_reference" className="focus-ring rounded-md border px-3 py-3" /></label>
      </div>
      <label className="grid gap-2 text-sm font-bold">
        Como gostaria de colaborar?
        <select name="support_mode" className="focus-ring rounded-md border px-3 py-3">
          <option>divulgar o catálogo</option>
          <option>reunir reservas</option>
          <option>organizar compra coletiva</option>
          <option>coordenar retirada ou entrega local</option>
          <option>conversar com a equipe</option>
        </select>
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">Pode coordenar retirada ou entrega local?<select name="can_coordinate_delivery" className="focus-ring rounded-md border px-3 py-3"><option>sim</option><option>talvez</option><option>não</option></select></label>
        <label className="grid gap-2 text-sm font-bold">Pode reunir reservas e pagamentos?<select name="can_coordinate_orders_payments" className="focus-ring rounded-md border px-3 py-3"><option>sim</option><option>talvez</option><option>não</option></select></label>
      </div>
      <label className="grid gap-2 text-sm font-bold">Mensagem<textarea maxLength={2000} name="notes" rows={5} className="focus-ring rounded-md border px-3 py-3" /></label>
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-px w-px opacity-0" />
      <label className="flex items-start gap-3 text-sm font-semibold"><input required type="checkbox" className="mt-1" /><span>Li a <Link href="/privacidade" target="_blank" className="font-black text-brasilBlue">política de privacidade</Link> e autorizo o uso dos dados para responder a esta solicitação.</span></label>
      <label className="flex items-start gap-3 text-sm font-semibold"><input required type="checkbox" className="mt-1" /><span>Entendo que o envio inicia uma conversa com a Loja e não cria obrigação de estoque, venda ou entrega.</span></label>
      <TurnstileWidget onToken={setToken} />
      <button disabled={state === "saving"} className="focus-ring min-h-12 rounded-md bg-lulaRed px-5 py-3 font-black text-white disabled:opacity-60">
        {state === "saving" ? "Enviando..." : "Quero ser ponto de venda"}
      </button>
    </form>
  );
}
