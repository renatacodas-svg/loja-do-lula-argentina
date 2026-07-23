import { StoreFeaturedProducts } from "@/components/store-featured-products";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

const howItWorks = [
  ["Escolha os produtos", "Veja os itens disponíveis e escolha o que quer reservar.", "/loja-assets/icon-basket.png"],
  ["Envie sua reserva", "Preencha seus dados, cidade, quantidade e preferências.", "/loja-assets/icon-document-arrow.png"],
  ["A equipe confirma", "Confirmamos estoque, forma de pagamento e entrega.", "/loja-assets/icon-check-seal.png"],
  ["Receba seu pedido", "Combinamos a entrega para que os produtos cheguem até você.", "/loja-assets/icon-circulation-box.png"]
] as const;

function LojaAssetIcon({ src, alt, className = "h-14 w-14" }: { src: string; alt: string; className?: string }) {
  return <span className={`${className} inline-block shrink-0`}><img src={src} alt={alt} className="h-full w-full object-contain" loading="lazy" /></span>;
}

export default async function LojaPage() {
  const products = await getProducts();

  return (
    <section className="loja-surface">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <section className="relative overflow-hidden rounded-lg border border-ink/15 bg-brasilGreen p-6 text-white shadow-sm md:p-10">
          <div className="absolute inset-0 bg-[url('/loja-assets/hero-pattern.png')] bg-cover bg-center opacity-50" aria-hidden />
          <div className="absolute inset-0 bg-brasilGreen/45" aria-hidden />
          <div className="absolute -right-12 bottom-8 h-28 w-28 rounded-full bg-brasilBlue/60" aria-hidden />
          <div className="relative grid gap-8 md:grid-cols-[0.4fr_0.6fr] md:items-center">
            <div className="flex min-h-72 items-center justify-center rounded-lg bg-transparent p-2">
              <img
                src="/loja-assets/logo-loja-vertical-white.png"
                alt="Loja do Lula"
                className="h-72 w-auto object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.22)] md:h-96"
              />
            </div>
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex rounded bg-lulaYellow px-3 py-1 text-sm font-black uppercase text-ink">Loja do Lula</p>
              <h1 className="loja-title text-4xl font-black leading-none md:text-6xl">Loja do Lula</h1>
              <p className="mt-5 max-w-2xl text-lg font-bold leading-8 text-white/94">
                Produtos para vestir suas ideias, compartilhar afetos e celebrar a cultura brasileira.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/84">
                Um catálogo independente para reservar produtos, combinar o pagamento e receber seu pedido na Argentina.
              </p>
            </div>
          </div>
        </section>

        <section id="como-funciona" className="scroll-mt-32 py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-black uppercase text-lulaRed">Como funciona</p>
              <h2 className="loja-title text-3xl font-black text-ink md:text-4xl">Como funciona a reserva</h2>
            </div>
            <p className="max-w-xl text-sm font-bold leading-6 text-zinc-700">
              A reserva não confirma automaticamente a compra. Depois do envio, a equipe entra em contato para confirmar disponibilidade, forma de pagamento e entrega.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {howItWorks.map(([title, text, icon], index) => (
              <article key={title} className="relative overflow-hidden rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
                <span className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-lulaYellow/30" aria-hidden />
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brasilGreen text-sm font-black text-white">{index + 1}</span>
                  <LojaAssetIcon src={icon} alt="" className="h-12 w-12" />
                </div>
                <h3 className="font-black text-ink">{title}</h3>
                <p className="mt-2 text-sm font-bold leading-6 text-zinc-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <StoreFeaturedProducts products={products} />

        <section className="mt-8 rounded-lg border border-ink/10 bg-white/70 p-4 text-sm font-bold leading-6 text-zinc-700">
          A equipe da Loja do Lula confirma cada solicitação, a disponibilidade dos produtos, a forma de pagamento e a entrega antes de concluir a compra.
        </section>
      </div>
    </section>
  );
}
