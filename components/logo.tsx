"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

/**
 * Surfaces only change size / layout — brand mark is always the green icon
 * plus designed Stockli text (no wordmark images).
 */
export type LogoSurface =
  | "auto"
  | "desktop"
  | "mobile"
  | "auth"
  | "auth-reset"
  | "mark";

/** @deprecated Color pairs collapsed to green icon + text; kept for call-site compatibility. */
export type BrandPair = "green" | "purple" | "gold";

const GREEN_ICON = "/brand/mystockli-icon-green.png";

export function pairForSurface(_surface: LogoSurface): BrandPair {
  return "green";
}

export function Logo({
  className,
  showText = true,
  beta = false,
  surface = "auto",
}: {
  className?: string;
  showText?: boolean;
  beta?: boolean;
  surface?: LogoSurface;
}) {
  if (surface === "mark") {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <BrandMark className="size-8" />
      </span>
    );
  }

  const size =
    surface === "desktop" || surface === "auto"
      ? "desktop"
      : surface === "mobile"
        ? "mobile"
        : "default";

  return (
    <span
      className={cn(
        "inline-flex items-center",
        size === "desktop" ? "gap-1.5" : "gap-2",
        className
      )}
    >
      <BrandMark
        className={cn(
          "shrink-0",
          size === "desktop" ? "size-7" : size === "mobile" ? "size-8" : "size-8"
        )}
      />
      {showText ? (
        <span className="flex items-center gap-1.5 leading-none">
          <BrandWordmark
            className={
              size === "desktop"
                ? "text-[1.125rem] sm:text-[1.2rem]"
                : size === "mobile"
                  ? "text-base"
                  : "text-[1.15rem] sm:text-xl"
            }
          />
          {beta ? (
            <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-500">
              Beta
            </span>
          ) : null}
        </span>
      ) : null}
    </span>
  );
}

/** Green hexagon app mark — single brand icon used everywhere. */
export function BrandMark({
  className,
  pair: _pair = "green",
}: {
  className?: string;
  pair?: BrandPair;
}) {
  return (
    <Image
      src={GREEN_ICON}
      alt=""
      width={80}
      height={90}
      className={cn("object-contain", className)}
      aria-hidden
      priority
    />
  );
}

/** Designed Stockli wordmark (text, not an image). */
export function BrandWordmark({
  className,
  pair: _pair = "green",
}: {
  className?: string;
  pair?: BrandPair;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline font-extrabold tracking-[-0.035em] text-[#009663]",
        className
      )}
      aria-label={APP_NAME}
    >
      Stockli
    </span>
  );
}

/** @deprecated Use BrandMark */
export function StockliGlyph({
  className,
  pair = "green",
}: {
  className?: string;
  pair?: BrandPair;
}) {
  return <BrandMark className={className} pair={pair} />;
}

/** @deprecated Use BrandMark */
export const MyStockliGlyph = StockliGlyph;
