import Link from "next/link";

export const metadata = {
  title: "Política de privacidade | Loja do Lula Argentina",
  description: "Como a Loja do Lula Argentina trata os dados de reservas."
};

export default function PrivacidadePage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <div className="rounded-lg bg-white p-6 shadow-soft md:p-10">
        <p className="text-sm font-black uppercase text-lulaRed">Privacidade</p>
        <h1 className="mt-2 text-4xl font-black">Política de privacidade</h1>
        <p className="mt-3 text-sm font-semibold text-zinc-500">Última atualização: 12 de julho de 2026.</p>

        <div className="mt-8 space-y-7 text-base leading-7 text-zinc-700">
          <section>
            <h2 className="text-xl font-black text-zinc-950">1. Responsável e contato</h2>
            <p className="mt-2">A Loja do Lula Argentina é responsável pelo tratamento dos dados enviados neste site. Dúvidas, pedidos de correção ou exclusão podem ser enviados para <a className="font-bold text-brasilBlue" href="mailto:lojadolula13@gmail.com">lojadolula13@gmail.com</a>.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-zinc-950">2. Dados coletados</h2>
            <p className="mt-2">Os formulários podem coletar nome, sobrenome, e-mail, WhatsApp, cidade, província, preferências de produto ou entrega, mensagens e informações fornecidas voluntariamente.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-zinc-950">3. Finalidades</h2>
            <p className="mt-2">Usamos os dados para organizar reservas e confirmar disponibilidade, pagamento e entrega dos produtos solicitados.</p>
            <p className="mt-2">O tratamento se baseia no consentimento informado manifestado no formulário. A pessoa pode retirar esse consentimento a qualquer momento pelo e-mail de contato, sem afetar os tratamentos realizados anteriormente.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-zinc-950">4. Armazenamento e acesso</h2>
            <p className="mt-2">Os dados ficam armazenados na infraestrutura do Supabase e são acessíveis somente por contas administrativas autorizadas. Não vendemos dados pessoais.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-zinc-950">5. Fornecedores e transferências internacionais</h2>
            <p className="mt-2">Os dados podem ser processados pelo Supabase, responsável pela infraestrutura de banco de dados, e pelo Vercel, responsável pela hospedagem do site. Esses serviços podem processar informações fora da Argentina. Adotamos configurações de acesso e fornecedores reconhecidos, sem compartilhar dados para publicidade comercial de terceiros.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-zinc-950">6. Retenção</h2>
            <p className="mt-2">Mantemos os dados pelo tempo necessário para atender a reserva e cumprir obrigações aplicáveis. Registros sem utilidade operacional devem ser eliminados periodicamente.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-zinc-950">7. Direitos</h2>
            <p className="mt-2">A pessoa pode solicitar informação, acesso, atualização, retificação ou supressão de seus dados pelo e-mail informado acima, observadas eventuais obrigações legais de conservação. Se a resposta não for satisfatória, pode apresentar uma reclamação perante a Agência de Acesso à Informação Pública (AAIP), autoridade de controle da Lei n.º 25.326.</p>
          </section>
          <section>
            <h2 className="text-xl font-black text-zinc-950">8. Segurança e atualizações</h2>
            <p className="mt-2">Aplicamos controles de acesso e medidas técnicas para reduzir riscos. Esta política poderá ser atualizada quando o site, seus fornecedores ou os requisitos aplicáveis mudarem.</p>
          </section>
        </div>

        <div className="mt-9"><Link href="/" className="font-black text-brasilBlue">Voltar ao site</Link></div>
      </div>
    </section>
  );
}
