import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Loja do Lula Argentina",
  description: "Catálogo de produtos, reservas e entregas da Loja do Lula na Argentina."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
