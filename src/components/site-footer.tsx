"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { complianceText, tseLinks } from "@/lib/mock-data";

export function SiteFooter() {
  const pathname = usePathname();
  const isEs = pathname.startsWith("/es");
  const isStore = true;

  if (isStore) {
    return (
      <footer className="border-t border-black/10 bg-brasilGreen text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="loja-title text-2xl font-black">{isEs ? "Tienda de Lula" : "Loja do Lula"}</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-white/75">{isEs ? "Reservas de productos con confirmación de disponibilidad, pago y entrega en Argentina." : "Reservas de produtos com confirmação de disponibilidade, pagamento e entrega na Argentina."}</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-black text-lulaYellow">
            <Link href={isEs ? "/es#produtos" : "/loja/catalogo"}>{isEs ? "Productos" : "Catálogo"}</Link>
            <Link href={isEs ? "/es#como-funciona" : "/#como-funciona"}>{isEs ? "Cómo funciona" : "Como funciona"}</Link>
            <Link href="/privacidade">{isEs ? "Privacidad" : "Privacidade"}</Link>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-black/10 bg-zinc-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="mb-3 text-lg font-black">Núcleo PT Argentina</p>
          {isEs ? (
            <>
              <p className="max-w-2xl text-sm leading-6 text-white/75">
                La actuación del Núcleo PT Argentina en la precampaña Lula 2026 observa las reglas electorales brasileñas,
                especialmente en relación con propaganda electoral, financiamiento colectivo, circulación de materiales y
                rendición de cuentas.
              </p>
            </>
          ) : (
            <>
              <p className="max-w-2xl text-sm leading-6 text-white/75">{complianceText}</p>
            </>
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-lulaYellow">
            <a href={tseLinks.financiamentoColetivo}>{isEs ? "Financiamiento colectivo en el TSE" : "Financiamento coletivo no TSE"}</a>
            <a href={tseLinks.normas2026}>{isEs ? "Normas electorales de 2026" : "Normas eleitorais de 2026"}</a>
          </div>
        </div>
        <div className="grid gap-2 text-sm font-semibold text-white/85">
          {isEs ? (
            <>
              <Link href="/es/quienes-somos">El Núcleo</Link>
              <Link href="/es/lula-2026">Lula 2026</Link>
              <Link href="/es/participar">Cómo participar</Link>
              <Link href="/privacidade">Privacidad</Link>
            </>
          ) : (
            <>
              <Link href="/quem-somos">O Núcleo</Link>
              <Link href="/lula-2026">Lula 2026</Link>
              <Link href="/nudos">Como participar</Link>
              <Link href="/atividades">Atividades</Link>
              <Link href="/privacidade">Política de privacidade</Link>
            </>
          )}
        </div>
      </div>
    </footer>
  );
}
