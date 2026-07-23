import { notFound } from "next/navigation";
import { ProductImage } from "@/components/product-image";
import { ButtonLink } from "@/components/ui";
import { getProducts } from "@/lib/data";
import { formatArs } from "@/lib/format";
import { SizeGuideDialog } from "@/components/size-guide-dialog";

export const dynamic = "force-dynamic";

export default async function ProductEsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const products = await getProducts();
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();

  const name = product.name_es || product.name;
  const description = product.description_es || product.description;
  const category = product.category_es || product.category;
  const status = product.status === "poucas_unidades" ? "producción a pedido" : product.status === "disponivel" ? "disponible" : "sin stock";

  return (
    <section className="loja-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-14 md:grid-cols-[1fr_0.9fr]">
        <div className="loja-pattern relative aspect-square overflow-hidden rounded-lg border-2 border-ink bg-lulaYellow shadow-poster">
          <ProductImage src={product.main_image_url} alt={name} />
          <span className="loja-diamond absolute left-4 top-4 h-16 w-24 bg-lulaYellow/95 shadow-[4px_4px_0_#1E1D1D]" aria-hidden />
        </div>
        <div className="rounded-lg border-2 border-ink bg-white p-6 shadow-soft">
          <p className="text-sm font-black uppercase text-brasilBlue">{category}</p>
          <h1 className="loja-title mt-2 text-5xl font-black text-ink">{name}</h1>
          <div className="mt-3">
            <p className="text-3xl font-black text-lulaRed">{formatArs(product.price_ars)}</p>
            <p className="text-xs font-bold uppercase text-zinc-500">Precio en pesos argentinos</p>
          </div>
          <p className="mt-4 text-base leading-7 text-zinc-700">{description}</p>
          <dl className="mt-6 grid gap-3 text-sm">
            <div className="rounded-md border border-ink/10 bg-paper p-3">
              <dt className="font-bold text-zinc-500">Estado</dt>
              <dd className="text-lg font-black">{status}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <p className="mb-2 text-sm font-bold">Variaciones</p>
            <div className="flex flex-wrap gap-2">
              {product.variations.map((variation) => (
                <span key={variation} className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm font-bold">{variation}</span>
              ))}
            </div>
            {product.size_guide_enabled ? <div className="mt-3"><SizeGuideDialog locale="es" guide={product.size_guide} /></div> : null}
          </div>
          <div className="mt-7">
            <ButtonLink href={`/es/reservar?produto=${product.slug}`}>Reservar este producto</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
