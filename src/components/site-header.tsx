"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navPt = [
  ["Início", "/"],
  ["O Núcleo", "/quem-somos"],
  ["Lula 2026", "/lula-2026"],
  ["Como participar", "/nudos"],
  ["Atividades", "/atividades"],
  ["Publicações", "/publicacoes"],
  ["Contato", "/contato"]
];

const navEs = [
  ["Inicio", "/es"],
  ["El Núcleo", "/es/quienes-somos"],
  ["Lula 2026", "/es/lula-2026"],
  ["Cómo participar", "/es/participar"],
  ["Actividades", "/es/actividades"],
  ["Publicaciones", "/es/publicaciones"],
  ["Contacto", "/es/contacto"]
];

const ptToEs: Record<string, string> = {
  "/": "/es",
  "/quem-somos": "/es/quienes-somos",
  "/lula-2026": "/es/lula-2026",
  "/nudos": "/es/participar",
  "/atividades": "/es/actividades",
  "/loja": "/es/tienda",
  "/publicacoes": "/es/publicaciones",
  "/contato": "/es/contacto"
};

const esToPt: Record<string, string> = Object.fromEntries(Object.entries(ptToEs).map(([pt, es]) => [es, pt]));

function languageLinks(pathname: string) {
  const normalized = pathname.replace(/\/$/, "") || "/";
  if (normalized.startsWith("/es/tienda/")) return { pt: normalized.replace("/es/tienda/", "/loja/"), es: normalized };
  if (normalized.startsWith("/loja/")) return { pt: normalized, es: normalized.replace("/loja/", "/es/tienda/") };
  if (normalized === "/es/reservar") return { pt: "/reservar", es: normalized };
  if (normalized === "/reservar") return { pt: normalized, es: "/es/reservar" };
  if (normalized.startsWith("/es")) {
    return { pt: esToPt[normalized] ?? "/", es: normalized };
  }
  return { pt: normalized, es: ptToEs[normalized] ?? "/es" };
}

export function SiteHeader() {
  const pathname = usePathname();
  const isEs = pathname.startsWith("/es");
  const isStore = true;
  const nav = isEs ? navEs : navPt;
  const links = languageLinks(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  if (isStore) {
    const storeHome = isEs ? "/es" : "/";
    const storeNav = isEs
      ? [["Inicio", "/es"], ["Cómo funciona", "/es#como-funciona"], ["Productos", "/es#produtos"]]
      : [["Início", "/"], ["Como funciona", "/#como-funciona"], ["Catálogo", "/loja/catalogo"]];

    return (
      <header className="sticky top-0 z-40 border-b border-black/10 bg-brasilGreen text-white shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href={storeHome} className="loja-title text-2xl font-black uppercase tracking-tight">{isEs ? "Tienda de Lula" : "Loja do Lula"}</Link>
          <nav className="hidden items-center gap-1 md:flex">
            {storeNav.map(([label, href]) => <Link key={href} href={href} className="rounded-md px-3 py-2 text-sm font-black hover:bg-white/10">{label}</Link>)}
            <div className="ml-2 flex overflow-hidden rounded-md border border-white/30 bg-white text-xs font-black">
              <Link href={links.pt} className={`px-2 py-2 ${!isEs ? "bg-lulaYellow text-ink" : "text-zinc-700"}`}>PT</Link>
              <Link href={links.es} className={`px-2 py-2 ${isEs ? "bg-lulaYellow text-ink" : "text-zinc-700"}`}>ES</Link>
            </div>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <div className="flex overflow-hidden rounded-md border border-white/30 bg-white text-xs font-black">
              <Link href={links.pt} className={`px-2 py-2 ${!isEs ? "bg-lulaYellow text-ink" : "text-zinc-700"}`}>PT</Link>
              <Link href={links.es} className={`px-2 py-2 ${isEs ? "bg-lulaYellow text-ink" : "text-zinc-700"}`}>ES</Link>
            </div>
            <button type="button" aria-expanded={menuOpen} aria-controls="store-mobile-navigation" onClick={() => setMenuOpen((open) => !open)} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-lulaYellow px-4 text-sm font-black text-ink">
              <Menu size={18} aria-hidden /> Menu
            </button>
          </div>
        </div>
        {menuOpen ? <nav id="store-mobile-navigation" className="border-t border-white/15 bg-brasilGreen px-4 py-3 md:hidden"><div className="mx-auto grid max-w-6xl gap-1">{storeNav.map(([label, href]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-3 text-sm font-black hover:bg-white/10">{label}</Link>)}</div></nav> : null}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-paper/92 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href={isEs ? "/es" : "/"} className="flex items-center gap-3">
          <span className="relative h-12 w-16 overflow-hidden rounded-md bg-white">
            <Image src="/argentina-pt-logo.png" alt="Argentina PT" fill className="object-contain" sizes="64px" priority />
          </span>
          <span>
            <strong className="block text-sm uppercase text-zinc-950">Núcleo PT Argentina</strong>
            <span className="text-xs font-semibold text-brasilBlue">{isEs ? "Comunidad y precampaña" : "Comunidade e pré-campanha"}</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-white">
              {label}
            </Link>
          ))}
          <div className="ml-2 flex overflow-hidden rounded-md border border-black/10 bg-white text-xs font-black">
            <Link href={links.pt} className={`px-2 py-2 ${!isEs ? "bg-lulaRed text-white" : "text-zinc-700"}`}>PT</Link>
            <Link href={links.es} className={`px-2 py-2 ${isEs ? "bg-lulaRed text-white" : "text-zinc-700"}`}>ES</Link>
          </div>
        </nav>
        <div className="flex items-center gap-2 lg:hidden">
          <div className="flex overflow-hidden rounded-md border border-black/10 bg-white text-xs font-black">
            <Link href={links.pt} className={`px-2 py-2 ${!isEs ? "bg-lulaRed text-white" : "text-zinc-700"}`}>PT</Link>
            <Link href={links.es} className={`px-2 py-2 ${isEs ? "bg-lulaRed text-white" : "text-zinc-700"}`}>ES</Link>
          </div>
          <button type="button" aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)} className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md bg-lulaRed px-4 text-sm font-bold text-white">
            <Menu size={18} aria-hidden />
            Menu
          </button>
        </div>
      </div>
      {menuOpen ? (
        <nav id="mobile-navigation" className="border-t border-black/10 bg-paper px-4 py-3 lg:hidden">
          <div className="mx-auto grid max-w-6xl gap-1">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-md px-3 py-3 text-sm font-bold text-zinc-800 hover:bg-white">{label}</Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
