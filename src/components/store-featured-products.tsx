"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { ButtonLink } from "@/components/ui";
import { createClient } from "@/lib/supabase";
import { Product } from "@/lib/types";

export function StoreFeaturedProducts({ products: initialProducts, locale = "pt" }: { products: Product[]; locale?: "pt" | "es" }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    void supabase.from("products").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) setLoadError(locale === "es" ? "No fue posible actualizar los productos. Recargá la página." : "Não foi possível atualizar os produtos. Tente recarregar a página.");
      else setProducts((data ?? []) as Product[]);
      setLoading(false);
    });
  }, [locale]);

  const es = locale === "es";

  const featured = products.filter((product) => product.featured).slice(0, 4);
  const showingFeatured = featured.length > 0;
  const visibleProducts = showingFeatured ? featured : products.slice(0, 4);

  return (
    <section id="produtos" className="scroll-mt-32 pb-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-black uppercase text-lulaRed">{es ? "Catálogo de productos" : "Catálogo de produtos"}</p>
          <h2 className="loja-title text-3xl font-black text-ink md:text-4xl">{showingFeatured ? (es ? "Productos destacados" : "Produtos em destaque") : (es ? "Productos más recientes" : "Produtos mais recentes")}</h2>
        </div>
        <p className="max-w-xl text-sm font-bold leading-6 text-zinc-700">
          {showingFeatured ? (es ? "Estos son los productos marcados como destacados en el panel admin." : "Estes são os produtos marcados como destaque no painel admin.") : (es ? "Todavía no hay destacados; por eso mostramos los productos más recientes." : "Ainda não há destaques marcados; por isso mostramos os produtos mais recentes.")} {es ? "Accedé al catálogo completo para consultar todos los artículos." : "Acesse o catálogo completo para consultar todos os itens."}
        </p>
      </div>
      {loading ? <p className="mb-5 rounded-md bg-white p-4 text-center text-sm font-bold text-zinc-600">{es ? "Actualizando productos..." : "Atualizando produtos..."}</p> : null}
      {loadError ? <p className="mb-5 rounded-md bg-red-50 p-4 text-center text-sm font-bold text-red-800">{loadError}</p> : null}
      {visibleProducts.length ? (
        <div className="grid gap-5 md:grid-cols-4">
          {visibleProducts.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}
        </div>
      ) : <p className="rounded-lg border border-dashed border-ink/20 bg-white p-6 text-center text-sm font-bold text-zinc-600">{es ? "No hay productos cargados en este momento." : "Nenhum produto está cadastrado no momento."}</p>}
      <div className="mt-7 flex justify-center"><ButtonLink href={es ? "/es/tienda#produtos" : "/loja/catalogo"} variant="secondary">{es ? "Ver todos los productos" : "Ver catálogo completo"}</ButtonLink></div>
    </section>
  );
}
