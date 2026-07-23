"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function TurnstileWidget({ onToken }: { onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const render = useCallback(() => {
    if (!siteKey || !container.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(container.current, {
      sitekey: siteKey,
      theme: "auto",
      callback: onToken,
      "expired-callback": () => onToken(""),
      "error-callback": () => onToken("")
    });
  }, [onToken, siteKey]);

  useEffect(() => {
    render();
    return () => {
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current);
    };
  }, [render]);

  if (!siteKey) return process.env.NODE_ENV === "development" ? null : <p className="text-sm font-bold text-red-700">Proteção antispam indisponível. Tente novamente mais tarde.</p>;

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={render} />
      <div ref={container} aria-label="Verificação antispam" />
    </>
  );
}
