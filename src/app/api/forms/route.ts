import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendFormNotification } from "@/lib/email-notifications";

const allowedKinds = new Set(["orders", "pack_requests"]);
const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

function invalidPayload(payload: unknown) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return true;
  const values = Object.values(payload as Record<string, unknown>);
  return values.some((value) => typeof value === "string" && value.length > 2500);
}

async function verifyTurnstile(token: string, ip: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return process.env.NODE_ENV === "development";
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
    signal: AbortSignal.timeout(8000)
  });
  if (!response.ok) return false;
  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}

export async function POST(request: NextRequest) {
  try {
    const origin = request.headers.get("origin") ?? "";
    const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const allowedOrigin = origin === "" || origin === "http://localhost:3000" || Boolean(configuredOrigin && origin === configuredOrigin);
    if (!allowedOrigin) return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 });

    const { kind, payload, token, website } = (await request.json()) as Record<string, unknown>;
    if (website) return NextResponse.json({ ok: true });
    if (typeof kind !== "string" || !allowedKinds.has(kind) || invalidPayload(payload)) {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }

    const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
    if (!(await verifyTurnstile(String(token ?? ""), ip))) {
      return NextResponse.json({ error: "Não foi possível validar a proteção antispam." }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) return NextResponse.json({ error: "Serviço temporariamente indisponível." }, { status: 503 });
    const supabase = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

    const fingerprint = createHash("sha256").update(`${ip}:${process.env.TURNSTILE_SECRET_KEY ?? "local"}`).digest("hex");
    const cutoff = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
    const { data: rate } = await supabase.from("form_rate_limits").select("attempts,window_started").eq("fingerprint", fingerprint).maybeSingle();
    if (rate && rate.window_started > cutoff && rate.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos." }, { status: 429 });
    }
    const attempts = rate && rate.window_started > cutoff ? rate.attempts + 1 : 1;
    await supabase.from("form_rate_limits").upsert({ fingerprint, attempts, window_started: attempts === 1 ? new Date().toISOString() : rate?.window_started });

    const { error } = await supabase.from(kind).insert(payload as Record<string, unknown>);
    if (error) return NextResponse.json({ error: "Não foi possível registrar o envio." }, { status: 400 });

    try {
      await sendFormNotification(kind, payload as Record<string, unknown>);
    } catch (notificationError) {
      console.error("Falha ao enviar notificação de formulário:", notificationError instanceof Error ? notificationError.message : "erro desconhecido");
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível processar o envio." }, { status: 500 });
  }
}
