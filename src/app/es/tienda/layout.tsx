import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tienda de Lula",
  description: "Catálogo de productos, reservas y entregas de la Tienda de Lula en Argentina."
};

export default function TiendaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
