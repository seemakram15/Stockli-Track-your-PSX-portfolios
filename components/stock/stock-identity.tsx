"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { StockLogo } from "@/components/stock/stock-logo";

type StockIdentitySize = "xs" | "sm" | "md" | "lg";

/**
 * Consistent stock mark + ticker (+ optional company name) used across lists,
 * tables, search, and cards.
 */
export function StockIdentity({
  symbol,
  name,
  image,
  size = "sm",
  href,
  subtitle,
  className,
  monoClassName,
  nameClassName,
  showName = true,
}: {
  symbol: string;
  name?: string | null;
  image?: string | null;
  size?: StockIdentitySize;
  /** When set, wraps the identity in a Next.js link. */
  href?: string;
  /** Extra line under the name (e.g. sector). */
  subtitle?: string | null;
  className?: string;
  monoClassName?: string;
  nameClassName?: string;
  /** Show company name under the ticker when available. */
  showName?: boolean;
}) {
  const normalized = symbol.trim().toUpperCase();
  const content = (
    <>
      <StockLogo symbol={normalized} name={name} image={image} size={size} />
      <span className="min-w-0 flex-1 text-left">
        <span
          className={cn(
            "block truncate font-semibold tracking-tight",
            size === "xs" || size === "sm" ? "text-sm" : "text-base",
            href && "group-hover/stock:text-primary",
            monoClassName
          )}
        >
          {normalized}
        </span>
        {showName && name ? (
          <span
            className={cn(
              "mt-0.5 block truncate text-muted-foreground",
              size === "lg" ? "text-sm" : "text-xs",
              nameClassName
            )}
          >
            {name}
          </span>
        ) : null}
        {subtitle ? (
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground/80">
            {subtitle}
          </span>
        ) : null}
      </span>
    </>
  );

  const layout = cn(
    "group/stock flex min-w-0 items-center",
    size === "xs" ? "gap-2" : size === "lg" ? "gap-3" : "gap-2.5",
    className
  );

  if (href) {
    return (
      <Link href={href} className={layout}>
        {content}
      </Link>
    );
  }

  return <span className={layout}>{content}</span>;
}
