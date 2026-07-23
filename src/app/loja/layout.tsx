import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loja do Lula",
  description: "Catálogo de produtos, reservas e entregas da Loja do Lula na Argentina."
};

export default function LojaLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
