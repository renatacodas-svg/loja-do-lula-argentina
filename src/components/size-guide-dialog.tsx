"use client";

import { useRef } from "react";
import { Product } from "@/lib/types";

export const defaultSizeGuide = {
  model: "Peinado 24.1 · adulto unissex",
  rows: [{ size: "1", length: 65, width: 48 }, { size: "2", length: 69, width: 49 }, { size: "3", length: 71, width: 51 }, { size: "4", length: 73, width: 54 }, { size: "5", length: 76, width: 56 }],
};

export function isSizedShirt(product: { name: string; name_es?: string | null; category: string; category_es?: string | null; variations: string[] }) {
  const text = [product.name, product.name_es, product.category, product.category_es].filter(Boolean).join(" ").toLocaleLowerCase();
  return /camiseta|remera/.test(text) && product.variations.length > 0;
}

export function getProductSizeGuide(product: Product) {
  const enabled = product.size_guide_enabled ?? isSizedShirt(product);
  if (!enabled) return null;
  return product.size_guide?.rows?.length ? product.size_guide : defaultSizeGuide;
}

export function SizeGuideDialog({ locale = "pt", guide = defaultSizeGuide }: { locale?: "pt" | "es"; guide?: Product["size_guide"] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const es = locale === "es";
  const activeGuide = guide?.rows?.length ? guide : defaultSizeGuide;
  return <>
    <button type="button" onClick={() => dialogRef.current?.showModal()} className="focus-ring text-sm font-black text-brasilBlue underline decoration-2 underline-offset-4">{es ? "Ver tabla de talles" : "Ver tabela de tamanhos"}</button>
    <dialog ref={dialogRef} onClick={(event) => { if (event.target === dialogRef.current) dialogRef.current.close(); }} className="w-[min(92vw,34rem)] rounded-lg border-2 border-ink bg-paper p-0 text-ink shadow-poster backdrop:bg-black/60">
      <div className="border-b-2 border-ink bg-brasilGreen px-5 py-4 text-white"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wider text-lulaYellow">{activeGuide.model || (es ? "Adulto unisex" : "Adulto unissex")}</p><h2 className="loja-title mt-1 text-3xl font-black">{es ? "Tabla de talles" : "Tabela de tamanhos"}</h2></div><button type="button" onClick={() => dialogRef.current?.close()} aria-label={es ? "Cerrar" : "Fechar"} className="focus-ring rounded-md border border-white/40 px-3 py-1 text-xl font-black">×</button></div></div>
      <div className="p-5"><div className="overflow-x-auto rounded-md border border-ink/20 bg-white"><table className="w-full border-collapse text-center text-sm"><thead className="bg-lulaYellow text-ink"><tr><th className="border-b border-ink/20 p-3">{es ? "Talle" : "Tamanho"}</th><th className="border-b border-ink/20 p-3">{es ? "Largo" : "Comprimento"}</th><th className="border-b border-ink/20 p-3">{es ? "Ancho" : "Largura"}</th></tr></thead><tbody>{activeGuide.rows.map(({ size, length, width }) => <tr key={size} className="odd:bg-paper"><th className="p-3 font-black">{size}</th><td className="p-3">{length} cm</td><td className="p-3">{width} cm</td></tr>)}</tbody></table></div><p className="mt-4 text-sm font-bold leading-6 text-zinc-700">{es ? "Largo: del hombro a la cintura. Ancho: de axila a axila." : "Comprimento: do ombro à cintura. Largura: de axila a axila."}</p><p className="mt-1 text-xs leading-5 text-zinc-500">{es ? "Todas las medidas están expresadas en centímetros y pueden variar hasta 1 cm." : "Todas as medidas estão em centímetros e podem variar até 1 cm."}</p></div>
    </dialog>
  </>;
}
