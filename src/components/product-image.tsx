"use client";

import { useState } from "react";
import { normalizeImageUrl } from "@/lib/image-url";
import { clsx } from "@/lib/utils";

function StoreImagePlaceholder({ className }: { className?: string }) {
  return (
    <div className={clsx("loja-pattern flex h-full w-full items-center justify-center bg-lulaYellow p-6 text-center text-ink", className)}>
      <div className="rounded-lg border-2 border-ink bg-paper/90 px-5 py-4 shadow-soft">
        <p className="text-xs font-black uppercase text-lulaRed">Loja do</p>
        <p className="loja-title text-4xl font-black leading-none">Lula</p>
        <p className="mt-2 text-xs font-bold text-ink/70">Imagem em breve</p>
      </div>
    </div>
  );
}

export function ProductImage({
  src,
  alt,
  className
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const imageUrl = normalizeImageUrl(src);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!imageUrl) {
    return <StoreImagePlaceholder className={className} />;
  }

  return (
    <div className={clsx("relative h-full w-full overflow-hidden bg-lulaYellow", className)}>
      {(!loaded || failed) && <StoreImagePlaceholder />}
      {!failed && (
        <img
          src={imageUrl}
          alt={alt}
          className={clsx("h-full w-full object-cover transition-opacity", loaded ? "opacity-100" : "opacity-0")}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
