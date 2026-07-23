import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { unstable_noStore as noStore } from "next/cache";
import { posts, products, publications } from "@/lib/mock-data";
import { Post, Product, Publication } from "@/lib/types";

const databaseTimeoutMs = 8000;

function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  return createSupabaseClient(url, key);
}

export async function getProducts(): Promise<Product[]> {
  noStore();
  const supabase = serverClient();
  if (!supabase) return products;

  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false }).abortSignal(AbortSignal.timeout(databaseTimeoutMs));
  if (error) {
    console.error("Não foi possível carregar os produtos do Supabase:", error.message);
    return [];
  }
  return data as Product[];
}

export async function getPosts(): Promise<Post[]> {
  noStore();
  const supabase = serverClient();
  if (!supabase) return posts;

  const { data, error } = await supabase.from("posts").select("*").eq("published", true).order("date", { ascending: false }).abortSignal(AbortSignal.timeout(databaseTimeoutMs));
  if (error) {
    console.error("Não foi possível carregar as atividades do Supabase:", error.message);
    return [];
  }
  return data as Post[];
}

export async function getPublications(): Promise<Publication[]> {
  noStore();
  const supabase = serverClient();
  if (!supabase) return publications;

  const { data, error } = await supabase.from("publications").select("*").eq("published", true).order("date", { ascending: false }).abortSignal(AbortSignal.timeout(databaseTimeoutMs));
  if (error) {
    console.error("Não foi possível carregar as publicações do Supabase:", error.message);
    return [];
  }
  return data as Publication[];
}
