import { Suspense } from "react";
import { ReservationForm } from "@/components/forms/reservation-form";
import { SectionTitle } from "@/components/ui";

export default function ReservarPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <SectionTitle eyebrow="Reserva" title="Reservar produtos" text="A reserva não baixa estoque automaticamente. A equipe confirma disponibilidade, pagamento e entrega manualmente." />
      <Suspense>
        <ReservationForm />
      </Suspense>
    </section>
  );
}
