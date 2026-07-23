"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { products } from "@/lib/mock-data";
import { Product } from "@/lib/types";
import { TurnstileWidget } from "@/components/turnstile-widget";
import { getProductSizeGuide, SizeGuideDialog } from "@/components/size-guide-dialog";

type SubmitState = "idle" | "saving" | "success" | "error";

function uuidOrNull(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : null;
}

export function ReservationForm({ locale = "pt" }: { locale?: "pt" | "es" }) {
  const params = useSearchParams();
  const initialSlug = params.get("produto") ?? "";
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productError, setProductError] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    async function loadProducts() {
      const supabase = createClient();
      if (!supabase) {
        setAvailableProducts(products);
        setProductsLoading(false);
        return;
      }
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) setProductError("Não foi possível carregar os produtos. Recarregue a página e tente novamente.");
      else setAvailableProducts((data ?? []) as Product[]);
      setProductsLoading(false);
    }
    loadProducts();
  }, []);

  const selected = useMemo(() => availableProducts.find((product) => product.slug === initialSlug) ?? availableProducts[0], [availableProducts, initialSlug]);

  async function submit(formData: FormData) {
    setState("saving");
    setMessage("");
    const productSlug = String(formData.get("product_slug"));
    const product = availableProducts.find((item) => item.slug === productSlug) ?? selected;
    if (!product) {
      setState("error");
      setMessage("Nenhum produto válido foi selecionado.");
      return;
    }
    const payload = {
      product_id: uuidOrNull(product.id),
      product_name_snapshot: product.name,
      variation: String(formData.get("variation") ?? ""),
      quantity: Number(formData.get("quantity") ?? 1),
      first_name: String(formData.get("first_name") ?? ""),
      last_name: String(formData.get("last_name") ?? ""),
      whatsapp: String(formData.get("whatsapp") ?? ""),
      email: String(formData.get("email") ?? ""),
      city: String(formData.get("city") ?? ""),
      delivery_preference: String(formData.get("delivery_preference") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      status: "pendente"
    };

    if (!token && process.env.NODE_ENV !== "development") {
      setState("error");
      setMessage("Conclua a verificação antispam antes de enviar.");
      return;
    }
    const response = await fetch("/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "orders", payload, token })
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({})) as { error?: string };
      setState("error");
      setMessage(result.error ?? "Não foi possível enviar a reserva. Confira os dados e tente novamente.");
      return;
    }

    setState("success");
    setMessage("Recebemos sua reserva. A equipe da Loja do Lula vai entrar em contato para confirmar disponibilidade, forma de pagamento e entrega.");
  }

  if (state === "success") {
    return <div className="rounded-lg bg-green-50 p-6 text-lg font-bold leading-7 text-green-900">{message}</div>;
  }

  if (productsLoading) return <div className="rounded-lg bg-white p-6 text-center font-bold text-zinc-600 shadow-soft">Carregando produtos...</div>;
  if (productError) return <div className="rounded-lg bg-red-50 p-6 text-center font-bold text-red-800">{productError}</div>;
  if (!selected) return <div className="rounded-lg bg-yellow-50 p-6 text-center font-bold text-yellow-900">Não há produtos disponíveis para reserva no momento. <Link href="/loja" className="underline">Voltar para a Loja</Link>.</div>;

  return (
    <form action={submit} className="grid gap-4 rounded-lg bg-white p-5 shadow-soft">
      {state === "error" ? <p className="rounded-md bg-red-50 p-3 text-sm font-bold text-red-800">{message}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">Nome<input required maxLength={100} name="first_name" className="focus-ring rounded-md border border-black/15 px-3 py-3" /></label>
        <label className="grid gap-2 text-sm font-bold">Sobrenome<input required maxLength={100} name="last_name" className="focus-ring rounded-md border border-black/15 px-3 py-3" /></label>
        <label className="grid gap-2 text-sm font-bold">WhatsApp (opcional)<input maxLength={40} name="whatsapp" className="focus-ring rounded-md border border-black/15 px-3 py-3" /></label>
        <label className="grid gap-2 text-sm font-bold">E-mail<input required maxLength={254} type="email" name="email" className="focus-ring rounded-md border border-black/15 px-3 py-3" /></label>
        <label className="grid gap-2 text-sm font-bold">Cidade<input required maxLength={120} name="city" className="focus-ring rounded-md border border-black/15 px-3 py-3" /></label>
        <label className="grid gap-2 text-sm font-bold">Produto<select name="product_slug" defaultValue={selected.slug} className="focus-ring rounded-md border border-black/15 px-3 py-3">{availableProducts.map((product) => <option key={product.id} value={product.slug}>{product.name}</option>)}</select></label>
        <div className="grid gap-2"><label className="grid gap-2 text-sm font-bold">Tamanho/variação<input maxLength={100} name="variation" placeholder={selected.variations.join(", ")} className="focus-ring rounded-md border border-black/15 px-3 py-3" /></label>{getProductSizeGuide(selected) ? <SizeGuideDialog locale={locale} guide={getProductSizeGuide(selected)} /> : null}</div>
        <label className="grid gap-2 text-sm font-bold">Quantidade<input required min={1} max={50} defaultValue={1} type="number" name="quantity" className="focus-ring rounded-md border border-black/15 px-3 py-3" /></label>
      </div>
      <label className="grid gap-2 text-sm font-bold">Forma preferida de entrega<select name="delivery_preference" className="focus-ring rounded-md border border-black/15 px-3 py-3"><option>retirar em evento</option><option>combinar entrega</option><option>ainda não sei</option></select></label>
      <label className="grid gap-2 text-sm font-bold">Observações<textarea maxLength={2000} name="notes" rows={4} className="focus-ring rounded-md border border-black/15 px-3 py-3" /></label>
      <label className="flex gap-3 text-sm font-semibold"><input required type="checkbox" />Entendo que esta é uma reserva e que a compra será confirmada pela equipe da Loja do Lula.</label>
      <label className="flex gap-3 text-sm font-semibold"><input required type="checkbox" />Aceito ser contatada/o pela equipe sobre esta reserva.</label>
      <label className="flex items-start gap-3 text-sm font-semibold"><input required type="checkbox" className="mt-1" /><span>Li a <Link href="/privacidade" target="_blank" className="font-black text-brasilBlue">política de privacidade</Link> e autorizo o uso dos dados para processar esta reserva.</span></label>
      <TurnstileWidget onToken={setToken} />
      <button disabled={state === "saving"} className="focus-ring min-h-12 rounded-md bg-lulaRed px-5 py-3 font-black text-white disabled:opacity-60">
        {state === "saving" ? "Enviando..." : "Enviar reserva"}
      </button>
    </form>
  );
}
