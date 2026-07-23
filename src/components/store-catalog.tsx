"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import { createClient } from "@/lib/supabase";
import { Product, ProductStatus } from "@/lib/types";

const statusOptions: Array<{ value: "todos" | ProductStatus; label: string }> = [
  { value: "todos", label: "Todos os status" },
  { value: "disponivel", label: "Disponível" },
  { value: "poucas_unidades", label: "Produção sob pedido" },
  { value: "esgotado", label: "Sem estoque" }
];

const preferredCategories = ["camisetas", "canecas", "adesivos", "bandeiras", "ecobags", "acessórios", "acessorios", "packs", "outros"];

function normalize(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
}

function prettyCategory(category: string) {
  if (!category) return "Outros";
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ");
}

export function StoreCatalog({ products: initialProducts }: { products: Product[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("todos");
  const [status, setStatus] = useState<"todos" | ProductStatus>("todos");

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    void supabase.from("products").select("*").order("created_at", { ascending: false }).then(({ data, error }) => {
      if (error) setLoadError("Não foi possível atualizar o catálogo. Tente recarregar a página.");
      else setProducts((data ?? []) as Product[]);
      setLoading(false);
    });
  }, []);

  const categories = useMemo(() => {
    const present = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));
    return present.sort((a, b) => {
      const aIndex = preferredCategories.indexOf(normalize(a));
      const bIndex = preferredCategories.indexOf(normalize(b));
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalize(query);
    return products.filter((product) => {
      const matchesQuery = !normalizedQuery || normalize(`${product.name} ${product.description} ${product.category}`).includes(normalizedQuery);
      const matchesCategory = category === "todos" || product.category === category;
      const matchesStatus = status === "todos" || product.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [products, query, category, status]);

  return (
    <div>
      <div className="mb-6 grid gap-3 rounded-lg border-2 border-ink bg-white p-4 shadow-soft md:grid-cols-[1fr_0.55fr_0.55fr]">
        <label className="grid gap-2 text-sm font-black text-ink">
          Buscar produto
          <input
            className="focus-ring rounded-md border border-ink/20 px-3 py-3 text-sm font-bold"
            placeholder="Camiseta, caneca, adesivo..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="grid gap-2 text-sm font-black text-ink">
          Categoria
          <select className="focus-ring rounded-md border border-ink/20 px-3 py-3 text-sm font-bold" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="todos">Todas</option>
            {categories.map((item) => <option key={item} value={item}>{prettyCategory(item)}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-black text-ink">
          Estoque
          <select className="focus-ring rounded-md border border-ink/20 px-3 py-3 text-sm font-bold" value={status} onChange={(event) => setStatus(event.target.value as "todos" | ProductStatus)}>
            {statusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-black uppercase text-brasilBlue">{filteredProducts.length} produto{filteredProducts.length === 1 ? "" : "s"} encontrado{filteredProducts.length === 1 ? "" : "s"}</p>
        <button
          type="button"
          className="focus-ring rounded-md border border-ink/20 bg-white px-4 py-2 text-sm font-black text-ink"
          onClick={() => { setQuery(""); setCategory("todos"); setStatus("todos"); }}
        >
          Limpar filtros
        </button>
      </div>

      {loading ? <p className="mb-5 rounded-md bg-white p-4 text-center text-sm font-bold text-zinc-600">Atualizando produtos...</p> : null}
      {loadError ? <p className="mb-5 rounded-md bg-red-50 p-4 text-center text-sm font-bold text-red-800">{loadError}</p> : null}

      {filteredProducts.length ? (
        <div className="grid gap-5 md:grid-cols-3">
          {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="loja-pattern rounded-lg border-2 border-ink bg-lulaYellow p-8 text-center shadow-soft">
          <h2 className="loja-title text-3xl font-black text-ink">Nenhum produto encontrado</h2>
          <p className="mt-2 text-sm font-bold text-ink/75">Tente limpar os filtros ou buscar por outro termo.</p>
        </div>
      )}
    </div>
  );
}
