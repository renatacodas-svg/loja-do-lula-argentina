import { Post, Product, Publication } from "./types";

export const complianceText =
  "A atuação do Núcleo PT Argentina na pré-campanha Lula 2026 observa as regras eleitorais brasileiras, especialmente em relação à propaganda eleitoral, financiamento coletivo, circulação de materiais e prestação de contas.";

export const institutionalLinks = {
  sriPt: "https://pt.org.br/secretaria-de-relacoes-internacionais/",
  nucleosExterior: "https://pt.org.br/"
};

export const tseLinks = {
  financiamentoColetivo: "https://www.tse.jus.br/",
  normas2026: "https://www.tse.jus.br/legislacao/compilada/res/2026"
};

export const reportLinks = {
  comunidadeBrasileiraArgentina: "#"
};

export const products: Product[] = [
  {
    id: "1",
    name: "Camiseta Democracia",
    name_es: "Remera Democracia",
    slug: "camiseta-democracia",
    description: "Camiseta em algodão para atividades, encontros e mobilização comunitária.",
    description_es: "Remera de algodao para actividades, encuentros y movilizacion comunitaria.",
    category: "camisetas",
    category_es: "remeras",
    price_ars: 18000,
    stock_quantity: 14,
    low_stock_threshold: 5,
    status: "disponivel",
    featured: true,
    main_image_url: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?auto=format&fit=crop&w=900&q=80",
    gallery_urls: [],
    variations: ["P", "M", "G", "GG"]
  },
  {
    id: "2",
    name: "Boné Brasil Popular",
    name_es: "Gorra Brasil Popular",
    slug: "bone-brasil-popular",
    description: "Boné bordado para rua, futebol, roda de samba e campanha de base.",
    description_es: "Gorra bordada para la calle, futbol, ronda de samba y campana de base.",
    category: "acessorios",
    category_es: "accesorios",
    price_ars: 12000,
    stock_quantity: 4,
    low_stock_threshold: 5,
    status: "poucas_unidades",
    featured: true,
    main_image_url: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80",
    gallery_urls: [],
    variations: ["Vermelho", "Branco"]
  },
  {
    id: "3",
    name: "Adesivos Comunidade",
    name_es: "Stickers Comunidad",
    slug: "adesivos-comunidade",
    description: "Kit com adesivos para distribuir em atividades, encontros e ações de mobilização.",
    description_es: "Kit con stickers para distribuir en actividades, encuentros y acciones de movilizacion.",
    category: "materiais",
    category_es: "materiales",
    price_ars: 2500,
    stock_quantity: 80,
    low_stock_threshold: 20,
    status: "disponivel",
    featured: false,
    main_image_url: "https://images.unsplash.com/photo-1590005354167-6da97870c757?auto=format&fit=crop&w=900&q=80",
    gallery_urls: [],
    variations: ["Kit 10", "Kit 25"]
  },
  {
    id: "4",
    name: "Bandeira Lula",
    name_es: "Bandera Lula",
    slug: "bandeira-lula",
    description: "Bandeira para eventos, fotos coletivas e pontos de encontro.",
    description_es: "Bandera para eventos, fotos colectivas y puntos de encuentro.",
    category: "bandeiras",
    category_es: "banderas",
    price_ars: 22000,
    stock_quantity: 0,
    low_stock_threshold: 3,
    status: "esgotado",
    featured: true,
    main_image_url: "https://images.unsplash.com/photo-1508349937151-22b68b72d5b1?auto=format&fit=crop&w=900&q=80",
    gallery_urls: [],
    variations: ["Unica"]
  }
];

export const posts: Post[] = [
  {
    id: "1",
    title: "Encontro brasileiro em Buenos Aires",
    slug: "encontro-brasileiro-buenos-aires",
    date: "2026-06-15",
    city: "Buenos Aires",
    category: "encontro",
    body: "Roda de conversa sobre democracia, comunidade brasileira e organização popular na Argentina.",
    cover_image_url: "",
    gallery_urls: [],
    published: true
  },
  {
    id: "2",
    title: "Futebol, samba e mobilização",
    slug: "futebol-samba-mobilizacao",
    date: "2026-05-28",
    city: "La Plata",
    category: "cultura",
    body: "Atividade cultural para aproximar grupos, coletivos e estudantes brasileiros.",
    cover_image_url: "",
    gallery_urls: [],
    published: true
  },
  {
    id: "3",
    title: "Materiais para campanha de base",
    slug: "materiais-campanha-base",
    date: "2026-04-12",
    city: "Córdoba",
    category: "loja",
    body: "Organização coletiva de materiais para apoiar atividades de comunicação e mobilização.",
    cover_image_url: "",
    gallery_urls: [],
    published: true
  }
];

export const publications: Publication[] = [
  {
    id: "comunidade-brasileira-argentina",
    title: "A comunidade brasileira na Argentina: dados, territórios e participação",
    date: "2025-08-01",
    description:
      "Relatório produzido pelo Núcleo PT Argentina sobre as características demográficas da população brasileira residente na Argentina, sua distribuição territorial, perfil etário e de gênero, dinâmica migratória e participação democrática.",
    category: "Publicação",
    file_url: reportLinks.comunidadeBrasileiraArgentina,
    published: true
  },
  {
    id: "1",
    title: "Comunicado do Núcleo PT Argentina",
    date: "2026-06-01",
    description: "Texto público sobre organização comunitária e participação democrática.",
    category: "Comunicados",
    published: true
  },
  {
    id: "2",
    title: "Guia de atividades comunitárias",
    date: "2026-05-05",
    description: "Material de apoio para encontros, rodas de conversa e eventos.",
    category: "Guias",
    published: true
  }
];
