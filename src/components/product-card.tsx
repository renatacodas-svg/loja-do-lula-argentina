import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { Product } from "@/lib/types";
import { formatArs } from "@/lib/format";
import { clsx } from "@/lib/utils";

export function ProductCard({ product, locale = "pt" }: { product: Product; locale?: "pt" | "es" }) {
  const name = locale === "es" && product.name_es ? product.name_es : product.name;
  const description = locale === "es" && product.description_es ? product.description_es : product.description;
  const category = locale === "es" && product.category_es ? product.category_es : product.category;
  const reserveLabel = locale === "es" ? "Reservar" : "Reservar";
  const statusLabel =
    product.status === "poucas_unidades"
      ? locale === "es" ? "producción a pedido" : "produção sob pedido"
      : product.status === "disponivel"
        ? locale === "es" ? "disponible" : "disponível"
        : locale === "es" ? "sin stock" : "sem estoque";
  const href = locale === "es" ? `/es/reservar?produto=${product.slug}` : `/reservar?produto=${product.slug}`;
  const detailHref = locale === "es" ? `/es/tienda/${product.slug}` : `/loja/${product.slug}`;

  return (
    <article className="group overflow-hidden rounded-lg border-2 border-ink bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-poster">
      <Link href={detailHref} className="block">
        <div className="loja-pattern relative aspect-[4/3] bg-lulaYellow">
          <ProductImage src={product.main_image_url} alt={name} />
          <span className="loja-diamond absolute right-3 top-3 h-10 w-14 bg-lulaYellow/95 shadow-[3px_3px_0_#1E1D1D]" aria-hidden />
        </div>
      </Link>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-xs font-black uppercase text-brasilBlue">{category}</p>
          <span
            className={clsx(
              "rounded border border-ink/15 px-2 py-1 text-xs font-black",
              product.status === "disponivel" && "bg-brasilGreen text-white",
              product.status === "poucas_unidades" && "bg-lulaYellow text-ink",
              product.status === "esgotado" && "bg-zinc-200 text-zinc-700"
            )}
          >
            {statusLabel}
          </span>
        </div>
        <h3 className="loja-title text-2xl font-black text-ink">{name}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">{description}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <strong className="block text-lg text-lulaRed">{formatArs(product.price_ars)}</strong>
            <span className="text-[11px] font-bold uppercase text-zinc-500">pesos argentinos</span>
          </div>
          <Link href={href} className="focus-ring rounded-md bg-lulaRed px-4 py-2 text-sm font-black text-white hover:bg-ink">
            {reserveLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
