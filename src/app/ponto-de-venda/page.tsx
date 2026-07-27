import { SalesPointRequestForm } from "@/components/forms/sales-point-request-form";
import { SectionTitle } from "@/components/ui";

export default function SalesPointPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <SectionTitle
        eyebrow="Rede da Loja"
        title="Quero ser ponto de venda"
        text="Ajude a Loja do Lula a chegar à sua cidade, organização, coletivo, grupo de amigos ou comunidade."
      />
      <div className="mb-6 rounded-lg bg-lulaYellow/20 p-5 text-sm font-bold leading-6 text-zinc-700">
        Você não precisa ter estoque próprio. A equipe conversa com você para combinar divulgação, reservas, pagamentos e logística de uma forma possível para cada local.
      </div>
      <SalesPointRequestForm />
    </section>
  );
}
