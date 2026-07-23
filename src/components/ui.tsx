import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { clsx } from "@/lib/utils";

export function ButtonLink({
  href,
  children,
  variant = "primary"
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "light";
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "focus-ring inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-black transition",
        variant === "primary" && "bg-lulaRed text-white hover:bg-ink",
        variant === "secondary" && "bg-brasilGreen text-white hover:bg-ink",
        variant === "light" && "border-2 border-ink/20 bg-white text-brasilBlue hover:border-ink hover:text-ink"
      )}
    >
      {children}
      <ArrowRight size={18} aria-hidden />
    </Link>
  );
}

export function SectionTitle({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      {eyebrow ? <p className="mb-2 text-sm font-bold uppercase tracking-wide text-lulaRed">{eyebrow}</p> : null}
      <h2 className="text-3xl font-black text-zinc-950 md:text-4xl">{title}</h2>
      {text ? <p className="mt-3 text-base leading-7 text-zinc-700">{text}</p> : null}
    </div>
  );
}
