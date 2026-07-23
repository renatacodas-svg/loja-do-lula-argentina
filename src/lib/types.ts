export type ProductStatus = "disponivel" | "poucas_unidades" | "esgotado";
export type OrderStatus = "pendente" | "realizada" | "cancelada";

export type Product = {
  id: string;
  name: string;
  name_es?: string;
  slug: string;
  description: string;
  description_es?: string;
  category: string;
  category_es?: string;
  price_ars: number;
  stock_quantity: number;
  low_stock_threshold: number;
  status: ProductStatus;
  featured: boolean;
  main_image_url: string;
  gallery_urls: string[];
  variations: string[];
  size_guide_enabled?: boolean;
  size_guide?: {
    model?: string;
    rows: Array<{ size: string; length: number; width: number }>;
  } | null;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  date: string;
  city: string;
  category: string;
  body: string;
  cover_image_url: string;
  gallery_urls: string[];
  external_link?: string;
  published: boolean;
};

export type Publication = {
  id: string;
  title: string;
  date: string;
  description: string;
  category: string;
  cover_image_url?: string;
  file_url?: string;
  external_link?: string;
  published: boolean;
};
