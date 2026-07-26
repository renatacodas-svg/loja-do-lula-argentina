"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { posts, products, publications } from "@/lib/mock-data";
import { createClient } from "@/lib/supabase";
import { Post, Product, Publication } from "@/lib/types";

type Tab = "dashboard" | "products" | "posts" | "publications" | "orders" | "contacts" | "setup";
type AdminMode = "nucleus" | "store";

type OrderRow = {
  id: string;
  product_name_snapshot: string;
  variation: string;
  quantity: number;
  first_name: string;
  last_name: string;
  whatsapp: string;
  email: string;
  city: string;
  delivery_preference: string;
  status: string;
  internal_notes?: string;
};

type ContactRow = {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  message: string;
  status: string;
  created_at: string;
};

const productCategories = [
  ["camisetas", "Camisetas", "remeras"],
  ["acessorios", "Acessórios", "accesorios"],
  ["bandeiras", "Bandeiras", "banderas"],
  ["adesivos", "Adesivos", "stickers"],
  ["materiais", "Materiais de campanha", "materiales"],
  ["livros", "Livros", "libros"],
  ["packs", "Packs de apoio", "packs"],
  ["outros", "Outros", "otros"]
] as const;

const categoryEsByPt = Object.fromEntries(productCategories.map(([value, , es]) => [value, es]));
const storageBucket = "site-assets";

const orderStatuses = [
  ["pendente", "Pendente"],
  ["realizada", "Realizada"],
  ["cancelada", "Cancelada"]
] as const;
const pendingOrderStatuses = ["nova", "em_contato", "confirmada", "paga", "pendente"];

function normalizeOrderStatus(status: string) {
  if (pendingOrderStatuses.includes(status)) return "pendente";
  if (status === "entregue") return "realizada";
  if (status === "cancelada") return "cancelada";
  return status;
}

function orderStatusLabel(status: string) {
  const normalized = normalizeOrderStatus(status);
  return orderStatuses.find(([value]) => value === normalized)?.[1] ?? status;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function availablePostSlug(title: string, currentId: string, activityItems: Post[]) {
  const base = slugify(title) || "atividade";
  const used = new Set(activityItems.filter((item) => item.id !== currentId).map((item) => item.slug));
  let slug = base;
  let suffix = 2;
  while (used.has(slug)) slug = `${base}-${suffix++}`;
  return slug;
}

function friendlyError(error: { message: string; code?: string }, item = "item") {
  const message = error.message.toLowerCase();
  if (error.code === "23505" || message.includes("duplicate key") || message.includes("unique constraint")) {
    return `Já existe um ${item} com esses dados. Altere o título e tente novamente.`;
  }
  if (message.includes("row-level security") || message.includes("permission") || message.includes("not authorized")) {
    return "Sua conta não tem permissão para realizar esta ação. Confirme o acesso de administrador.";
  }
  if (message.includes("jwt") || message.includes("session")) {
    return "Sua sessão expirou. Entre novamente no painel e repita a ação.";
  }
  if (error.code === "23503" || message.includes("foreign key constraint")) {
    return `Este ${item} está vinculado a outros registros e não pode ser apagado agora.`;
  }
  return `Não foi possível salvar: ${error.message}`;
}

export function AdminShell({ mode = "nucleus" }: { mode?: AdminMode }) {
  const supabase = createClient();
  const hasSupabase = Boolean(supabase);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [active, setActive] = useState<Tab>("dashboard");
  const [items, setItems] = useState<Product[]>(hasSupabase ? [] : products);
  const [activityItems, setActivityItems] = useState<Post[]>(hasSupabase ? [] : posts);
  const [publicationItems, setPublicationItems] = useState<Publication[]>(hasSupabase ? [] : publications);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [message, setMessage] = useState("");
  const [postDraftVersion, setPostDraftVersion] = useState(0);
  const [publicationDraftVersion, setPublicationDraftVersion] = useState(0);

  useEffect(() => {
    async function load() {
      if (!supabase) {
        setSessionReady(true);
        return;
      }
      const { data } = await supabase.auth.getSession();
      setIsLogged(Boolean(data.session));
      setSessionReady(true);
      if (data.session) await refresh();
    }
    load();
  }, []);

  async function refresh() {
    if (!supabase) return;
    const failedSections: string[] = [];
    if (mode === "store") {
      const [productResult, orderResult] = await Promise.all([
        supabase.from("products").select("*").order("created_at", { ascending: false }),
        supabase.from("orders").select("*").order("created_at", { ascending: false })
      ]);
      setItems((productResult.data ?? []) as Product[]);
      if (orderResult.data) setOrders(orderResult.data as OrderRow[]);
      if (productResult.error) failedSections.push("produtos");
      if (orderResult.error) failedSections.push("reservas");
    } else {
      const [postResult, publicationResult, contactResult] = await Promise.all([
        supabase.from("posts").select("*").order("date", { ascending: false }),
        supabase.from("publications").select("*").order("date", { ascending: false }),
        supabase.from("contacts").select("*").order("created_at", { ascending: false })
      ]);
      setActivityItems((postResult.data ?? []) as Post[]);
      setPublicationItems((publicationResult.data ?? []) as Publication[]);
      if (contactResult.data) setContacts(contactResult.data as ContactRow[]);
      if (postResult.error) failedSections.push("atividades");
      if (publicationResult.error) failedSections.push("publicações");
      if (contactResult.error) failedSections.push("mensagens");
    }
    if (failedSections.length) setMessage(`Não foi possível carregar ${failedSections.join(", ")}. Confirme as permissões da conta administradora no Supabase.`);
  }

  async function login() {
    setMessage("");
    if (!supabase) {
      setIsLogged(true);
      setMessage("Modo demo: configure Supabase para login real. As mudanças ficam só nesta sessão.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setMessage(`Não foi possível entrar: ${error.message}`);
      return;
    }
    setIsLogged(true);
    await refresh();
  }

  async function logout() {
    setMessage("");
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setMessage("Não foi possível encerrar a sessão. Tente novamente.");
        return;
      }
    }
    setIsLogged(false);
    setEmail("");
    setPassword("");
    setMessage("Sessão encerrada com segurança.");
  }

  async function persist(table: "products" | "posts" | "publications", id: string, payload: Record<string, unknown>) {
    if (!supabase) return null;
    return id ? supabase.from(table).update(payload).eq("id", id).select("id") : supabase.from(table).insert(payload).select("id");
  }

  async function removeItem(table: "products" | "posts" | "publications", id: string, label: string) {
    setMessage("");
    if (!window.confirm(`Apagar "${label}"? Esta ação não pode ser desfeita.`)) return;

    if (supabase) {
      if (table === "products") {
        const { error: unlinkError } = await supabase.from("orders").update({ product_id: null }).eq("product_id", id);
        if (unlinkError) {
          setMessage(`Não foi possível preservar as reservas deste produto: ${friendlyError(unlinkError, "produto")}`);
          return;
        }
      }

      const { data: deletedItems, error } = await supabase.from(table).delete().eq("id", id).select("id");
      if (error) {
        setMessage(friendlyError(error, "item"));
        return;
      }
      if (!deletedItems?.length) {
        setMessage("O item não foi apagado. Sua sessão pode ter expirado ou sua conta não tem permissão de administrador.");
        return;
      }
      setMessage(table === "products" ? "Produto apagado com sucesso. As reservas antigas foram preservadas." : "Item apagado com sucesso.");
      await refresh();
      return;
    }

    setMessage("Item apagado nesta sessão demo.");
    if (table === "products") setItems(items.filter((item) => item.id !== id));
    if (table === "posts") setActivityItems(activityItems.filter((item) => item.id !== id));
    if (table === "publications") setPublicationItems(publicationItems.filter((item) => item.id !== id));
  }

  async function saveProduct(formData: FormData) {
    setMessage("");
    const id = String(formData.get("id") ?? "");
    const category = String(formData.get("category"));
    const wantsFeatured = formData.getAll("featured").includes("true");
    const sizeGuideEnabled = formData.getAll("size_guide_enabled").includes("true");
    const sizeGuideRows = String(formData.get("size_guide_data") ?? "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
      const [size, length, width] = line.split(/[|,;]/).map((value) => value.trim());
      return { size, length: Number(length), width: Number(width) };
    });
    if (sizeGuideEnabled && (!sizeGuideRows.length || sizeGuideRows.some((row) => !row.size || !Number.isFinite(row.length) || row.length <= 0 || !Number.isFinite(row.width) || row.width <= 0))) {
      setMessage("Revise a tabela de tamanhos. Use uma linha por tamanho no formato: tamanho | comprimento | largura.");
      return false;
    }
    const currentFeaturedCount = items.filter((item) => item.featured && item.id !== id).length;
    if (wantsFeatured && currentFeaturedCount >= 4) {
      setMessage("Limite de 4 produtos em destaque na home da Loja. Desmarque outro produto antes de destacar este.");
      return false;
    }
    const payload = {
      name: String(formData.get("name")),
      name_es: String(formData.get("name_es") ?? ""),
      slug: String(formData.get("slug")),
      description: String(formData.get("description")),
      description_es: String(formData.get("description_es") ?? ""),
      category,
      category_es: categoryEsByPt[category] ?? category,
      price_ars: Number(formData.get("price_ars")),
      stock_quantity: Number(formData.get("stock_quantity")),
      low_stock_threshold: Number(formData.get("low_stock_threshold")),
      status: String(formData.get("status")),
      featured: wantsFeatured,
      main_image_url: String(formData.get("main_image_url")),
      gallery_urls: [],
      variations: String(formData.get("variations") ?? "").split(",").map((item) => item.trim()).filter(Boolean),
      size_guide_enabled: sizeGuideEnabled,
      size_guide: sizeGuideEnabled ? { model: String(formData.get("size_guide_model") ?? "").trim(), rows: sizeGuideRows } : null
    };
    const result = await persist("products", id, payload);
    if (result?.error) {
      setMessage(friendlyError(result.error, "produto"));
      return false;
    }
    if (supabase && !result?.data?.length) {
      setMessage("O produto não foi salvo. Sua conta não tem permissão para alterar este registro ou ele já não existe.");
      return false;
    }
    setMessage(id ? "Produto atualizado com sucesso." : "Produto criado com sucesso.");
    if (supabase) {
      await refresh();
      return true;
    }
    setItems(id ? items.map((item) => (item.id === id ? ({ ...item, ...payload } as Product) : item)) : [{ id: crypto.randomUUID(), ...payload } as Product, ...items]);
    return true;
  }

  async function savePost(formData: FormData) {
    setMessage("");
    const id = String(formData.get("id") ?? "");
    const title = String(formData.get("title")).trim();
    const existingPost = activityItems.find((item) => item.id === id);
    const payload = {
      title,
      slug: existingPost?.slug ?? availablePostSlug(title, id, activityItems),
      date: String(formData.get("date")),
      city: String(formData.get("city")),
      category: String(formData.get("category")),
      body: String(formData.get("body")),
      cover_image_url: String(formData.get("cover_image_url") ?? ""),
      gallery_urls: [],
      external_link: String(formData.get("external_link") ?? ""),
      published: formData.get("published") === "on"
    };
    const result = await persist("posts", id, payload);
    if (result?.error) return setMessage(friendlyError(result.error, "atividade"));
    setMessage(id ? "Atividade atualizada com sucesso." : `Atividade criada com sucesso. Slug: ${payload.slug}`);
    if (!id) setPostDraftVersion((version) => version + 1);
    if (supabase) return refresh();
    setActivityItems((current) => id ? current.map((item) => (item.id === id ? ({ ...item, ...payload } as Post) : item)) : [{ id: crypto.randomUUID(), ...payload } as Post, ...current]);
  }

  async function savePublication(formData: FormData) {
    setMessage("");
    const id = String(formData.get("id") ?? "");
    const payload = {
      title: String(formData.get("title")),
      date: String(formData.get("date")),
      description: String(formData.get("description")),
      category: String(formData.get("category")),
      cover_image_url: String(formData.get("cover_image_url") ?? ""),
      file_url: String(formData.get("file_url") ?? ""),
      external_link: String(formData.get("external_link") ?? ""),
      published: formData.get("published") === "on"
    };
    const result = await persist("publications", id, payload);
    if (result?.error) return setMessage(friendlyError(result.error, "publicação"));
    setMessage(id ? "Publicação atualizada com sucesso." : "Publicação criada com sucesso.");
    if (!id) setPublicationDraftVersion((version) => version + 1);
    if (supabase) return refresh();
    setPublicationItems((current) => id ? current.map((item) => (item.id === id ? ({ ...item, ...payload } as Publication) : item)) : [{ id: crypto.randomUUID(), ...payload } as Publication, ...current]);
  }

  async function updateOrder(id: string, status: string, internal_notes: string) {
    setMessage("");
    if (supabase) {
      const { error } = await supabase.from("orders").update({ status, internal_notes }).eq("id", id);
      if (error) {
        setMessage(friendlyError(error, "reserva"));
        return;
      }
      setMessage("Reserva atualizada com sucesso.");
      await refresh();
    } else {
      setMessage("Reserva atualizada nesta sessão demo.");
      setOrders(orders.map((order) => (order.id === id ? { ...order, status, internal_notes } : order)));
    }
  }

  async function updateContactStatus(id: string, status: string) {
    setMessage("");
    if (!supabase) return;
    const { error } = await supabase.from("contacts").update({ status }).eq("id", id);
    if (error) {
      setMessage(friendlyError(error, "mensagem"));
      return;
    }
    setContacts((current) => current.map((contact) => (contact.id === id ? { ...contact, status } : contact)));
    setMessage(status === "lido" ? "Mensagem marcada como lida com sucesso." : "Mensagem marcada como nova com sucesso.");
  }

  if (!sessionReady) return <div className="mx-auto max-w-4xl px-4 py-14">Carregando...</div>;

  if (!isLogged) {
    return (
      <section className="mx-auto max-w-md px-4 py-14">
        <h1 className="mb-5 text-3xl font-black">Painel admin</h1>
        <div className="grid gap-4 rounded-lg bg-white p-5 shadow-soft">
          {message ? <p className="rounded-md bg-yellow-50 p-3 text-sm font-bold">{message}</p> : null}
          <AdminInput label="E-mail" value={email} onChange={setEmail} />
          <AdminInput label="Senha" type={showPassword ? "text" : "password"} value={password} onChange={setPassword} />
          <label className="flex cursor-pointer items-center gap-2 text-sm font-bold">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(event) => setShowPassword(event.target.checked)}
              className="h-4 w-4 accent-lulaRed"
            />
            Ver senha
          </label>
          <button onClick={login} className="focus-ring min-h-12 rounded-md bg-lulaRed font-black text-white">Entrar</button>
        </div>
      </section>
    );
  }

  const pendingOrders = orders.filter((order) => normalizeOrderStatus(order.status) === "pendente").length;
  const completedOrders = orders.filter((order) => normalizeOrderStatus(order.status) === "realizada").length;
  const canceledOrders = orders.filter((order) => normalizeOrderStatus(order.status) === "cancelada").length;
  const lowStock = items.filter((item) => item.stock_quantity <= item.low_stock_threshold).length;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black">{mode === "store" ? "Admin da Loja" : "Admin do Núcleo"}</h1>
          <p className="text-sm text-zinc-600">{mode === "store" ? "Produtos, reservas e estoque." : "Atividades, publicações e mensagens institucionais."}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {mode === "store" ? <Link href="/loja" className="rounded-md bg-brasilGreen px-4 py-2 text-sm font-bold text-white shadow-soft">Ver Loja</Link> : null}
          <Link href="/" className="rounded-md bg-white px-4 py-2 text-sm font-bold shadow-soft">Ver site</Link>
          <button type="button" onClick={() => void logout()} className="rounded-md bg-zinc-800 px-4 py-2 text-sm font-bold text-white shadow-soft">Sair do admin</button>
        </div>
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {(mode === "store"
          ? (["dashboard", "products", "orders", "setup"] as const)
          : (["dashboard", "posts", "publications", "contacts", "setup"] as const)
        ).map((tab) => (
          <button key={tab} onClick={() => setActive(tab)} className={`rounded-md px-4 py-2 text-sm font-black ${active === tab ? "bg-lulaRed text-white" : "bg-white"}`}>
            {tab === "dashboard" ? "Dashboard" : tab === "products" ? "Produtos" : tab === "posts" ? "Atividades" : tab === "publications" ? "Publicações" : tab === "orders" ? "Reservas" : tab === "contacts" ? "Mensagens" : "Configuração"}
          </button>
        ))}
      </div>
      {message ? <p role="status" aria-live="polite" className={`mb-4 rounded-md p-3 text-sm font-bold ${/sucesso|modo demo/i.test(message) ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{message}</p> : null}
      {active === "dashboard" ? <Dashboard mode={mode} pendingOrders={pendingOrders} completedOrders={completedOrders} canceledOrders={canceledOrders} products={items.length} posts={activityItems.length} publications={publicationItems.length} lowStock={lowStock} orders={orders.length} contacts={contacts.length} /> : null}
      {active === "products" ? <ProductsAdmin items={items} saveProduct={saveProduct} removeProduct={(id, label) => removeItem("products", id, label)} /> : null}
      {active === "posts" ? <PostsAdmin posts={activityItems} draftVersion={postDraftVersion} savePost={savePost} removePost={(id, label) => removeItem("posts", id, label)} /> : null}
      {active === "publications" ? <PublicationsAdmin publications={publicationItems} draftVersion={publicationDraftVersion} savePublication={savePublication} removePublication={(id, label) => removeItem("publications", id, label)} /> : null}
      {active === "orders" ? <OrdersAdmin orders={orders} updateOrder={updateOrder} /> : null}
      {active === "contacts" ? <ContactsAdmin contacts={contacts} updateStatus={updateContactStatus} /> : null}
      {active === "setup" ? <SetupAdmin hasSupabase={hasSupabase} /> : null}
    </section>
  );
}

function Dashboard({ mode, pendingOrders, completedOrders, canceledOrders, products, posts, publications, lowStock, orders, contacts }: { mode: AdminMode; pendingOrders: number; completedOrders: number; canceledOrders: number; products: number; posts: number; publications: number; lowStock: number; orders: number; contacts: number }) {
  const cards = mode === "store"
    ? [["Reservas pendentes", pendingOrders], ["Reservas realizadas", completedOrders], ["Reservas canceladas", canceledOrders], ["Reservas totais", orders], ["Produtos", products], ["Estoque baixo", lowStock]]
    : [["Mensagens", contacts], ["Atividades", posts], ["Publicações", publications]];
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value]) => <div key={label} className="rounded-lg bg-white p-5 shadow-soft"><p className="text-sm font-bold text-zinc-500">{label}</p><strong className="mt-2 block text-4xl">{value}</strong></div>)}</div>;
}

function SetupAdmin({ hasSupabase }: { hasSupabase: boolean }) {
  const envRows = [
    ["NEXT_PUBLIC_SUPABASE_URL", hasSupabase],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", hasSupabase]
  ];

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-lg bg-white p-5 shadow-soft">
        <h2 className="text-xl font-black">Estado da conexão</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Esta checagem olha as variáveis públicas usadas pelo site. Com Supabase conectado, o login do admin e os formulários passam a usar o banco real.
        </p>
        <div className="mt-4 grid gap-3">
          {envRows.map(([label, ok]) => (
            <div key={String(label)} className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-3 text-sm font-bold">
              <span>{label}</span>
              <span className={ok ? "text-green-700" : "text-lulaRed"}>{ok ? "configurada" : "pendente"}</span>
            </div>
          ))}
        </div>
        <div className={`mt-4 rounded-md p-3 text-sm font-bold ${hasSupabase ? "bg-green-50 text-green-800" : "bg-yellow-50 text-yellow-900"}`}>
          {hasSupabase ? "Supabase conectado. O admin usa login real e dados do banco." : "Modo demo. Os dados públicos usam exemplos locais e mudanças do admin não persistem no banco."}
        </div>
      </section>

      <section className="rounded-lg bg-white p-5 shadow-soft">
        <h2 className="text-xl font-black">Checklist para ativar</h2>
        <ol className="mt-3 grid gap-3 text-sm leading-6 text-zinc-700">
          <li><strong>1.</strong> Criar um projeto no Supabase.</li>
          <li><strong>2.</strong> Rodar <code className="rounded bg-zinc-100 px-1">supabase/schema.sql</code> no SQL Editor.</li>
          <li><strong>3.</strong> Opcionalmente rodar <code className="rounded bg-zinc-100 px-1">supabase/seed.sql</code> para dados de exemplo.</li>
          <li><strong>4.</strong> Criar a pessoa admin em Authentication.</li>
          <li><strong>5.</strong> Inserir a pessoa usuária na tabela <code className="rounded bg-zinc-100 px-1">profiles</code> com role <code className="rounded bg-zinc-100 px-1">admin</code>.</li>
          <li><strong>6.</strong> Preencher <code className="rounded bg-zinc-100 px-1">.env.local</code> com Project URL e anon key.</li>
          <li><strong>7.</strong> Reiniciar o servidor local.</li>
        </ol>
      </section>
    </div>
  );
}
function ProductsAdmin({ items, saveProduct, removeProduct }: { items: Product[]; saveProduct: (data: FormData) => Promise<boolean>; removeProduct: (id: string, label: string) => void }) {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const featuredCount = items.filter((item) => item.featured).length;
  const availableCount = items.filter((item) => item.status === "disponivel").length;
  const lowStockCount = items.filter((item) => item.stock_quantity <= item.low_stock_threshold).length;
  const selectedProduct = items.find((item) => item.id === selectedId);
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const filteredItems = items
    .filter((item) => !normalizedQuery || [item.name, item.name_es, item.category, item.slug].some((value) => value?.toLocaleLowerCase("pt-BR").includes(normalizedQuery)))
    .sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));

  const statusLabel: Record<Product["status"], string> = {
    disponivel: "Disponível",
    poucas_unidades: "Produção sob pedido",
    esgotado: "Sem estoque"
  };

  return (
    <EditorLayout
      left={<ProductForm title="Novo produto" saveProduct={saveProduct} featuredLimitReached={featuredCount >= 4} />}
      right={
        <div className="grid gap-4">
          <div className="rounded-lg bg-white p-5 shadow-soft">
            <h2 className="text-xl font-black">Produtos cadastrados</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">Busque um produto e clique na linha para abrir seu editor. Apenas um formulário fica aberto por vez.</p>
            <div className="mt-4 grid gap-2 text-sm font-bold sm:grid-cols-3">
              <span className="rounded-md bg-zinc-50 px-3 py-2">{items.length} produto{items.length === 1 ? "" : "s"}</span>
              <span className="rounded-md bg-green-50 px-3 py-2 text-green-800">{availableCount} disponível{availableCount === 1 ? "" : "is"}</span>
              <span className="rounded-md bg-yellow-50 px-3 py-2 text-yellow-900">{featuredCount}/4 em destaque</span>
              <span className="rounded-md bg-red-50 px-3 py-2 text-lulaRed">{lowStockCount} com estoque baixo</span>
            </div>
            <label className="mt-4 grid gap-2 text-sm font-bold">
              Buscar produtos
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, categoria ou slug" className="focus-ring rounded-md border px-3 py-3" />
            </label>
          </div>
          <div className="overflow-hidden rounded-lg bg-white shadow-soft">
            <div className="flex items-center justify-between border-b px-4 py-3 text-xs font-black uppercase text-zinc-500">
              <span>{filteredItems.length} resultado{filteredItems.length === 1 ? "" : "s"}</span>
              {selectedProduct ? <button type="button" onClick={() => setSelectedId(null)} className="text-brasilBlue">Fechar editor</button> : null}
            </div>
            {filteredItems.length ? (
              <ul className="divide-y">
                {filteredItems.map((item) => (
                  <li key={item.id}>
                    <button type="button" onClick={() => setSelectedId(item.id)} aria-expanded={selectedId === item.id} className={`focus-ring grid w-full grid-cols-[3rem_1fr_auto] items-center gap-3 px-4 py-3 text-left hover:bg-zinc-50 ${selectedId === item.id ? "bg-yellow-50" : ""}`}>
                      <img src={item.main_image_url} alt="" className="h-12 w-12 rounded-md bg-zinc-100 object-cover" />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <strong className="truncate text-sm text-zinc-900">{item.name}</strong>
                          {item.featured ? <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-black uppercase text-yellow-900">Destaque</span> : null}
                        </span>
                        <span className="mt-1 block truncate text-xs font-semibold text-zinc-500">{item.category} · Estoque: {item.stock_quantity} · ARS {item.price_ars.toLocaleString("es-AR")}</span>
                      </span>
                      <span className={`rounded-full px-2 py-1 text-xs font-black ${item.status === "disponivel" ? "bg-green-50 text-green-800" : item.status === "esgotado" ? "bg-red-50 text-red-800" : "bg-yellow-50 text-yellow-900"}`}>{statusLabel[item.status]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p className="p-5 text-sm font-semibold text-zinc-500">Nenhum produto encontrado.</p>}
          </div>
          {selectedProduct ? (
            <ProductForm key={selectedProduct.id} title={`Editar: ${selectedProduct.name}`} product={selectedProduct} saveProduct={saveProduct} removeProduct={removeProduct} onSaved={() => setSelectedId(null)} featuredLimitReached={featuredCount >= 4 && !selectedProduct.featured} />
          ) : (
            <p className="rounded-lg border border-dashed border-zinc-300 bg-white p-5 text-center text-sm font-semibold text-zinc-500">Selecione um produto na lista para editar.</p>
          )}
        </div>
      }
    />
  );
}

function ProductForm({ title, product, saveProduct, removeProduct, onSaved, featuredLimitReached }: { title: string; product?: Product; saveProduct: (data: FormData) => Promise<boolean>; removeProduct?: (id: string, label: string) => void; onSaved?: () => void; featuredLimitReached?: boolean }) {
  async function submitProduct(formData: FormData) {
    const saved = await saveProduct(formData);
    if (saved) onSaved?.();
  }

  return (
    <form action={submitProduct} className="grid gap-5 rounded-lg bg-white p-5 shadow-soft">
      <div>
        <h2 className="text-xl font-black">{title}</h2>
        <p className="mt-1 text-xs font-semibold leading-5 text-zinc-500">
          Campos com * são obrigatórios. Depois de salvar, confira a Loja para ver como o produto aparece no site.
        </p>
      </div>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <fieldset className="grid gap-3 rounded-lg border border-zinc-200 p-4">
        <legend className="px-1 text-sm font-black text-zinc-700">Identificação</legend>
        <div className="grid gap-3 md:grid-cols-2">
          <AdminInput name="name" label="Nome em português *" defaultValue={product?.name} required hint="Nome que aparece no catálogo em português." />
          <AdminInput name="name_es" label="Nome em espanhol" defaultValue={product?.name_es} hint="Opcional. Se ficar vazio, o site usa o nome em português." />
          <AdminInput name="slug" label="Slug *" defaultValue={product?.slug} required hint="Endereço do produto. Use minúsculas, sem acentos e com hífen: camiseta-verde." />
          <AdminSelect name="category" label="Categoria" defaultValue={product?.category ?? "materiais"} options={productCategories.map(([value, label]) => [value, label])} hint="A categoria em espanhol é preenchida automaticamente." />
        </div>
      </fieldset>

      <fieldset className="grid gap-3 rounded-lg border border-zinc-200 p-4">
        <legend className="px-1 text-sm font-black text-zinc-700">Preço, estoque e status</legend>
        <div className="grid gap-3 md:grid-cols-3">
          <AdminInput name="price_ars" label="Preço em pesos argentinos (ARS) *" type="number" defaultValue={product?.price_ars} required hint="Digite só números, sem ponto nem símbolo de moeda." />
          <AdminInput name="stock_quantity" label="Estoque *" type="number" defaultValue={product?.stock_quantity} required hint="Quantidade disponível para reservar." />
          <AdminInput name="low_stock_threshold" label="Alerta de estoque baixo *" type="number" defaultValue={product?.low_stock_threshold ?? 5} required hint="Quando o estoque chegar nesse número, entra no alerta do dashboard." />
        </div>
        <AdminSelect
          name="status"
          label="Status"
          defaultValue={product?.status ?? "disponivel"}
          options={[["disponivel", "Disponível"], ["poucas_unidades", "Produção sob pedido"], ["esgotado", "Sem estoque"]]}
          hint="Esse status aparece no card do produto e ajuda a orientar as reservas."
        />
        <label className="flex items-start gap-2 rounded-md bg-zinc-50 p-3 text-sm font-bold">
          <input key={`featured-${product?.id ?? "new"}-${product?.featured ? "on" : "off"}`} name="featured" type="checkbox" value="true" defaultChecked={product?.featured ?? false} disabled={featuredLimitReached} className="mt-1" />
          <span>
            Destaque na home da Loja
            <span className="block text-xs font-semibold leading-5 text-zinc-500">
              Use para os produtos que devem aparecer na vitrine inicial. O catálogo completo continua mostrando todos. Limite: 4 produtos em destaque.
            </span>
            {featuredLimitReached ? <span className="mt-1 block text-xs font-black text-lulaRed">Limite atingido: desmarque outro destaque antes de marcar este.</span> : null}
          </span>
        </label>
      </fieldset>

      <fieldset className="grid gap-3 rounded-lg border border-zinc-200 p-4">
        <legend className="px-1 text-sm font-black text-zinc-700">Imagem e textos</legend>
        <AdminFileField name="main_image_url" label="Imagem principal do produto *" folder="produtos" defaultValue={product?.main_image_url} accept="image/*" required />
        <AdminInput name="variations" label="Variações separadas por vírgula" defaultValue={product?.variations.join(", ")} hint="Exemplo: P, M, G ou Verde, Vermelha. Se não houver variação, pode deixar vazio." />
        <AdminTextarea name="description" label="Descrição em português *" defaultValue={product?.description} required hint="Texto curto para explicar o produto no card e na página do produto." />
        <AdminTextarea name="description_es" label="Descrição em espanhol" defaultValue={product?.description_es} hint="Opcional. Se ficar vazio, o site usa a descrição em português." />
      </fieldset>

      <fieldset className="grid gap-3 rounded-lg border border-zinc-200 p-4">
        <legend className="px-1 text-sm font-black text-zinc-700">Tabela de tamanhos</legend>
        <label className="flex items-start gap-2 rounded-md bg-zinc-50 p-3 text-sm font-bold">
          <input name="size_guide_enabled" type="checkbox" value="true" defaultChecked={product?.size_guide_enabled ?? false} className="mt-1" />
          <span>Exibir tabela neste produto<span className="block text-xs font-semibold leading-5 text-zinc-500">Marque para camisetas, remeras ou qualquer produto que precise de medidas.</span></span>
        </label>
        <AdminInput name="size_guide_model" label="Modelo ou fornecedor" defaultValue={product?.size_guide?.model} hint="Exemplo: Peinado 24.1 · adulto unissex." />
        <AdminTextarea name="size_guide_data" label="Medidas: tamanho | comprimento | largura" defaultValue={product?.size_guide?.rows?.map((row) => `${row.size} | ${row.length} | ${row.width}`).join("\n") ?? "1 | 65 | 48\n2 | 69 | 49\n3 | 71 | 51\n4 | 73 | 54\n5 | 76 | 56"} hint="Uma linha por tamanho. Todas as medidas são em centímetros. Exemplo: M | 71 | 51." />
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <button className="focus-ring min-h-10 rounded-md bg-lulaRed px-4 text-sm font-black text-white">Salvar produto</button>
        {product && removeProduct ? <button type="button" onClick={() => removeProduct(product.id, product.name)} className="focus-ring min-h-10 rounded-md bg-zinc-200 px-4 text-sm font-black text-zinc-800">Apagar produto</button> : null}
      </div>
    </form>
  );
}

function PostsAdmin({ posts, draftVersion, savePost, removePost }: { posts: Post[]; draftVersion: number; savePost: (data: FormData) => void; removePost: (id: string, label: string) => void }) {
  return <EditorLayout left={<PostForm key={draftVersion} title="Nova atividade" savePost={savePost} />} right={posts.map((post) => <PostForm key={post.id} title={`Editar: ${post.title}`} post={post} savePost={savePost} removePost={removePost} />)} />;
}

function PostForm({ title, post, savePost, removePost }: { title: string; post?: Post; savePost: (data: FormData) => void; removePost?: (id: string, label: string) => void }) {
  return (
    <form action={savePost} className="grid gap-3 rounded-lg bg-white p-5 shadow-soft">
      <h2 className="text-xl font-black">{title}</h2>
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <AdminInput name="title" label="Título" defaultValue={post?.title} required hint={post ? `Endereço atual: ${post.slug}` : "O endereço (slug) será criado automaticamente a partir do título."} />
        <AdminInput name="date" label="Data" type="date" defaultValue={post?.date} required />
        <AdminInput name="city" label="Cidade" defaultValue={post?.city} required />
      </div>
      <AdminInput name="category" label="Categoria" defaultValue={post?.category} />
      <AdminFileField name="cover_image_url" label="Imagem de capa (opcional)" folder="atividades" defaultValue={post?.cover_image_url} accept="image/*" />
      <AdminInput name="external_link" label="Link externo (opcional)" defaultValue={post?.external_link} />
      <AdminTextarea name="body" label="Texto / resumo da atividade" defaultValue={post?.body} required />
      <label className="flex gap-2 text-sm font-bold"><input name="published" type="checkbox" defaultChecked={post?.published ?? true} />Publicado</label>
      <div className="flex flex-wrap gap-2">
        <button className="focus-ring min-h-10 rounded-md bg-lulaRed px-4 text-sm font-black text-white">Salvar atividade</button>
        {post && removePost ? <button type="button" onClick={() => removePost(post.id, post.title)} className="focus-ring min-h-10 rounded-md bg-zinc-200 px-4 text-sm font-black text-zinc-800">Apagar atividade</button> : null}
      </div>
    </form>
  );
}

function PublicationsAdmin({ publications, draftVersion, savePublication, removePublication }: { publications: Publication[]; draftVersion: number; savePublication: (data: FormData) => void; removePublication: (id: string, label: string) => void }) {
  return <EditorLayout left={<PublicationForm key={draftVersion} title="Nova publicação/material" savePublication={savePublication} />} right={publications.map((publication) => <PublicationForm key={publication.id} title={`Editar: ${publication.title}`} publication={publication} savePublication={savePublication} removePublication={removePublication} />)} />;
}

function PublicationForm({ title, publication, savePublication, removePublication }: { title: string; publication?: Publication; savePublication: (data: FormData) => void; removePublication?: (id: string, label: string) => void }) {
  return (
    <form action={savePublication} className="grid gap-3 rounded-lg bg-white p-5 shadow-soft">
      <h2 className="text-xl font-black">{title}</h2>
      {publication ? <input type="hidden" name="id" value={publication.id} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <AdminInput name="title" label="Título" defaultValue={publication?.title} required />
        <AdminInput name="date" label="Data" type="date" defaultValue={publication?.date} required />
      </div>
      <AdminInput name="category" label="Categoria" defaultValue={publication?.category} />
      <AdminFileField name="cover_image_url" label="Imagem de capa (opcional)" folder="publicacoes/capas" defaultValue={publication?.cover_image_url} accept="image/*" help="Use JPG, PNG ou WEBP para a capa visual da publicação." />
      <AdminFileField name="file_url" label="PDF ou arquivo para download" folder="publicacoes/arquivos" defaultValue={publication?.file_url} accept="application/pdf,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,image/*" help="Aqui entram PDFs e materiais para baixar. Se o seletor não mostrar o arquivo, escolha Todos os arquivos na janela do Windows." />
      <AdminInput name="external_link" label="Link externo (opcional)" defaultValue={publication?.external_link} />
      <AdminTextarea name="description" label="Descrição" defaultValue={publication?.description} required />
      <label className="flex gap-2 text-sm font-bold"><input name="published" type="checkbox" defaultChecked={publication?.published ?? true} />Publicado</label>
      <div className="flex flex-wrap gap-2">
        <button className="focus-ring min-h-10 rounded-md bg-lulaRed px-4 text-sm font-black text-white">Salvar publicação</button>
        {publication && removePublication ? <button type="button" onClick={() => removePublication(publication.id, publication.title)} className="focus-ring min-h-10 rounded-md bg-zinc-200 px-4 text-sm font-black text-zinc-800">Apagar publicação</button> : null}
      </div>
    </form>
  );
}

function OrdersAdmin({ orders, updateOrder }: { orders: OrderRow[]; updateOrder: (id: string, status: string, notes: string) => void }) {
  const [filter, setFilter] = useState<"todas" | "pendente" | "realizada" | "cancelada">("todas");
  if (!orders.length) return <div className="rounded-lg bg-white p-6 shadow-soft">Ainda não há reservas no banco.</div>;
  const filteredOrders = filter === "todas" ? orders : orders.filter((order) => normalizeOrderStatus(order.status) === filter);
  const filterOptions = [
    ["todas", "Todas", orders.length],
    ["pendente", "Pendentes", orders.filter((order) => normalizeOrderStatus(order.status) === "pendente").length],
    ["realizada", "Realizadas", orders.filter((order) => normalizeOrderStatus(order.status) === "realizada").length],
    ["cancelada", "Canceladas", orders.filter((order) => normalizeOrderStatus(order.status) === "cancelada").length]
  ] as const;
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(([value, label, count]) => (
          <button key={value} type="button" onClick={() => setFilter(value)} className={`rounded-md px-4 py-2 text-sm font-black ${filter === value ? "bg-brasilBlue text-white" : "bg-white"}`}>
            {label} ({count})
          </button>
        ))}
      </div>
      {filteredOrders.map((order) => (
        <form key={order.id} action={(data) => updateOrder(order.id, String(data.get("status")), String(data.get("internal_notes")))} className="rounded-lg bg-white p-5 shadow-soft">
          <div className="grid gap-2 md:grid-cols-[1fr_auto]">
            <div>
              <h3 className="text-lg font-black">{order.product_name_snapshot} - {order.quantity} un.</h3>
              <p className="text-sm leading-6 text-zinc-600">{order.first_name} {order.last_name} - {order.city} - {order.whatsapp} - {order.delivery_preference}</p>
              <p className="text-sm text-zinc-600">Variação: {order.variation || "não informada"}</p>
              <p className="mt-1 text-xs font-bold uppercase text-zinc-500">Status atual: {orderStatusLabel(order.status)}</p>
            </div>
            <select name="status" defaultValue={normalizeOrderStatus(order.status)} className="focus-ring rounded-md border px-3 py-2">
              {orderStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <textarea name="internal_notes" defaultValue={order.internal_notes ?? ""} placeholder="Notas internas da equipe" className="focus-ring mt-3 w-full rounded-md border px-3 py-3" />
          <button className="focus-ring mt-3 rounded-md bg-brasilBlue px-4 py-2 text-sm font-black text-white">Salvar status e nota</button>
        </form>
      ))}
    </div>
  );
}

function ContactsAdmin({ contacts, updateStatus }: { contacts: ContactRow[]; updateStatus: (id: string, status: string) => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (!contacts.length) return <div className="rounded-lg bg-white p-6 shadow-soft">Ainda não há mensagens no banco.</div>;
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-soft">
      {contacts.map((contact) => {
        const isOpen = openId === contact.id;
        const isNew = contact.status !== "lido";
        return (
          <article key={contact.id} className="border-b border-zinc-100 last:border-0">
            <button type="button" onClick={() => setOpenId(isOpen ? null : contact.id)} className="focus-ring grid w-full gap-2 px-5 py-4 text-left md:grid-cols-[1fr_auto]">
              <span><strong className="block">{contact.name}</strong><span className="text-sm text-zinc-600">{contact.email}</span></span>
              <span className="flex items-center gap-3 text-xs font-bold text-zinc-500"><span className={isNew ? "rounded-full bg-yellow-100 px-2 py-1 text-yellow-900" : "rounded-full bg-green-100 px-2 py-1 text-green-800"}>{isNew ? "Nova" : "Lida"}</span>{new Date(contact.created_at).toLocaleString("pt-BR")}</span>
            </button>
            {isOpen ? (
              <div className="grid gap-3 bg-zinc-50 px-5 py-4">
                {contact.whatsapp ? <p className="text-sm"><strong>WhatsApp:</strong> {contact.whatsapp}</p> : null}
                <pre className="whitespace-pre-wrap rounded-md bg-white p-4 text-sm leading-6 text-zinc-700">{contact.message}</pre>
                <button type="button" onClick={() => updateStatus(contact.id, isNew ? "lido" : "novo")} className="w-fit rounded-md bg-brasilBlue px-4 py-2 text-sm font-black text-white">{isNew ? "Marcar como lida" : "Marcar como nova"}</button>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function EditorLayout({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr]"><div>{left}</div><div className="grid gap-4">{right}</div></div>;
}

function AdminInput({ label, name, type = "text", required, defaultValue, value, onChange, hint }: { label: string; name?: string; type?: string; required?: boolean; defaultValue?: string | number; value?: string; onChange?: (value: string) => void; hint?: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <input name={name} type={type} required={required} defaultValue={defaultValue} value={value} onChange={onChange ? (event) => onChange(event.target.value) : undefined} className="focus-ring rounded-md border px-3 py-3" />
      {hint ? <span className="text-xs font-semibold leading-5 text-zinc-500">{hint}</span> : null}
    </label>
  );
}

function AdminTextarea({ label, name, required, defaultValue, hint }: { label: string; name: string; required?: boolean; defaultValue?: string; hint?: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <textarea name={name} required={required} defaultValue={defaultValue} rows={4} className="focus-ring rounded-md border px-3 py-3" />
      {hint ? <span className="text-xs font-semibold leading-5 text-zinc-500">{hint}</span> : null}
    </label>
  );
}

function AdminSelect({ label, name, options, defaultValue, hint }: { label: string; name: string; options: Array<[string, string]>; defaultValue?: string; hint?: string }) {
  return (
    <label className="grid gap-2 text-sm font-bold">
      {label}
      <select name={name} defaultValue={defaultValue} className="focus-ring rounded-md border px-3 py-3">{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      {hint ? <span className="text-xs font-semibold leading-5 text-zinc-500">{hint}</span> : null}
    </label>
  );
}

function AdminFileField({ label, name, folder, defaultValue, accept, required, help }: { label: string; name: string; folder: string; defaultValue?: string; accept?: string; required?: boolean; help?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [status, setStatus] = useState("");
  const supabase = createClient();

  async function uploadFile(file: File) {
    setStatus("Subindo arquivo...");
    if (!supabase) {
      setStatus("Configure o Supabase para usar upload.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setStatus("Arquivo maior que 50 MB. Escolha um arquivo menor.");
      return;
    }
    const allowedMimeTypes = new Set([
      "image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/zip"
    ]);
    if (!allowedMimeTypes.has(file.type) || /\.(svg|html?|js|mjs|exe|bat|cmd|ps1)$/i.test(file.name)) {
      setStatus("Formato de arquivo não permitido por segurança.");
      return;
    }
    if (/\.(heic|heif)$/i.test(file.name) || ["image/heic", "image/heif"].includes(file.type)) {
      setStatus("Use JPG, PNG ou WEBP. Imagens HEIC/HEIF do celular podem não aparecer no site.");
      return;
    }

    const safeName = file.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/-+/g, "-")
      .toLowerCase();
    const path = `${folder}/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage.from(storageBucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (error) {
      const lowerMessage = error.message.toLowerCase();
      if (lowerMessage.includes("bucket not found")) {
        setStatus("Bucket site-assets não encontrado. Rode o SQL do Storage no Supabase.");
      } else if (lowerMessage.includes("row-level security") || lowerMessage.includes("not authorized") || lowerMessage.includes("permission")) {
        setStatus("Permissão bloqueada no Storage. Rode as policies do bucket site-assets no Supabase.");
      } else {
        setStatus(error.message);
      }
      return;
    }

    const { data } = supabase.storage.from(storageBucket).getPublicUrl(path);
    setUrl(data.publicUrl);
    setStatus("Arquivo enviado com sucesso.");
  }

  return (
    <div className="grid gap-2 text-sm font-bold">
      <span>{label}</span>
      <input
        type="file"
        accept={accept}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void uploadFile(file);
        }}
        className="focus-ring rounded-md border px-3 py-3"
      />
      <input name={name} required={required} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Este campo se preenche sozinho depois do upload" className="focus-ring rounded-md border px-3 py-3" />
      {url ? <a href={url} target="_blank" className="text-xs font-bold text-brasilBlue">Abrir arquivo atual</a> : null}
      <p className="text-xs font-semibold text-zinc-500">{help ?? "Escolha um arquivo acima. Quando o upload funcionar, a URL aparece aqui automaticamente. Depois clique em salvar."}</p>
      {status ? <p className="text-xs font-semibold text-zinc-500">{status}</p> : null}
    </div>
  );
}
