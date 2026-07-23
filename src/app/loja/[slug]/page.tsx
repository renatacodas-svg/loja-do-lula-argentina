import { notFound } from "next/navigation";
import { ProductImage } from "@/components/product-image";
import { ButtonLink } from "@/components/ui";
import { formatArs } from "@/lib/format";
import { getProducts } from "@/lib/data";
import { complianceText } from "@/lib/mock-data";
import { SizeGuideDialog } from "@/components/size-guide-dialog";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();

  return (
    <section className="loja-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[1fr_0.9fr]">
        <div className="loja-pattern relative aspect-square overflow-hidden rounded-lg border-2 border-ink bg-lulaYellow shadow-poster">
          <ProductImage src={product.main_image_url} alt={product.name} />
          <span className="loja-diamond absolute left-4 top-4 h-16 w-24 bg-lulaYellow/95 shadow-[4px_4px_0_#1E1D1D]" aria-hidden />
        </div>
        <div className="rounded-lg border-2 border-ink bg-white p-6 shadow-soft">
          <p className="text-sm font-black uppercase text-brasilBlue">{product.category}</p>
          <h1 className="loja-title mt-2 text-5xl font-black text-ink">{product.name}</h1>
          <div className="mt-3">
            <p className="text-3xl font-black text-lulaRed">{formatArs(product.price_ars)}</p>
            <p className="text-xs font-bold uppercase text-zinc-500">Preço em pesos argentinos</p>
          </div>
          <p className="mt-4 text-base leading-7 text-zinc-700">{product.description}</p>
          <dl className="mt-6 grid gap-3 text-sm">
            <div className="rounded-md border border-ink/10 bg-paper p-3">
              <dt className="font-bold text-zinc-500">Status</dt>
              <dd className="text-lg font-black">{product.status === "poucas_unidades" ? "produção sob pedido" : product.status === "disponivel" ? "disponível" : "sem estoque"}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <p className="mb-2 text-sm font-bold">Variações</p>
            <div className="flex flex-wrap gap-2">
              {product.variations.map((variation) => (
                <span key={variation} className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm font-bold">
                  {variation}
                </span>
              ))}
            </div>
            {product.size_guide_enabled ? <div className="mt-3"><SizeGuideDialog guide={product.size_guide} /></div> : null}
          </div>
          <div className="mt-7">
            <ButtonLink href={`/reservar?produto=${product.slug}`}>Reservar este produto</ButtonLink>
          </div>
          <p className="mt-6 text-xs leading-5 text-zinc-500">{complianceText}</p>
        </div>
      </div>
    </section>
  );
}
