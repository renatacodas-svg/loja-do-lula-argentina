import { Suspense } from "react";
import { ReservationForm } from "@/components/forms/reservation-form";
import { SectionTitle } from "@/components/ui";

export default function ReservarEsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <SectionTitle
        eyebrow="Reserva"
        title="Reservar productos"
        text="La reserva no descuenta stock automáticamente. El equipo confirma disponibilidad, pago y entrega de forma manual."
      />
      <Suspense>
        <ReservationForm locale="es" />
      </Suspense>
    </section>
  );
}
