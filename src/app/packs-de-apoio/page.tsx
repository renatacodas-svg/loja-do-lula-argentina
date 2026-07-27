import { Suspense } from "react";
import { PackRequestForm } from "@/components/forms/pack-request-form";
import { SectionTitle } from "@/components/ui";

export default function PacksPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <SectionTitle
        eyebrow="Packs de apoio"
        title="Peça um pack e converse com a equipe"
        text="Escolha um valor de referência e conte o que você gostaria de organizar. A equipe da Loja do Lula entra em contato para montar uma proposta possível."
      />
      <div className="mb-6 rounded-lg bg-lulaYellow/20 p-5 text-sm font-bold leading-6 text-zinc-700">
        Este é um pedido de contato, não um produto do catálogo. O envio não confirma automaticamente compra, pagamento ou entrega.
      </div>
      <Suspense>
        <PackRequestForm />
      </Suspense>
    </section>
  );
}
