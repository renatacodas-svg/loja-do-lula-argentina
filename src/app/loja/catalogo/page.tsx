import { ButtonLink } from "@/components/ui";
import { StoreCatalog } from "@/components/store-catalog";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function CatalogoLojaPage() {
  const products = await getProducts();

  return (
    <section className="loja-surface">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="mb-8 rounded-lg border border-ink/15 bg-brasilGreen p-6 text-white shadow-sm md:p-8">
          <p className="mb-2 text-sm font-black uppercase text-lulaYellow">Loja do Lula</p>
          <h1 className="loja-title text-4xl font-black leading-none md:text-6xl">Catálogo completo</h1>
          <p className="mt-4 max-w-2xl text-lg font-bold leading-8 text-white/85">Veja todos os produtos disponíveis para reserva.</p>
          <div className="mt-6"><ButtonLink href="/loja" variant="light">Voltar para a Loja</ButtonLink></div>
        </div>
        <StoreCatalog products={products} />
      </div>
    </section>
  );
}
