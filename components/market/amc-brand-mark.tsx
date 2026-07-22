"use client";

import { useState } from "react";
import Image from "next/image";
import { Building2 } from "lucide-react";
import { amcIconUrl, identifyAmcBrand } from "@/lib/amc-brands";
import { cn } from "@/lib/utils";

export function AmcBrandMark({
  label,
  selected = false,
  size = "md",
  showName = false,
  logoUrl,
  className,
}: {
  label: string;
  selected?: boolean;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  logoUrl?: string | null;
  className?: string;
}) {
  const brand = identifyAmcBrand(label);
  // Prefer local official logos; remote MUFAP URLs are often hotlink-blocked in browsers.
  const iconUrl = amcIconUrl(brand) ?? (logoUrl && !logoUrl.includes("mufap.com.pk") ? logoUrl : null);
  const [imgFailed, setImgFailed] = useState(false);

  const dimension = size === "sm" ? "size-7" : size === "lg" ? "size-10" : "size-8";
  const showLogo = iconUrl && !imgFailed;

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border shadow-sm",
          dimension,
          selected ? "border-primary-foreground/30 bg-white" : "border-border bg-background"
        )}
        style={{ backgroundColor: selected ? undefined : `${brand.color}14` }}
      >
        {showLogo ? (
          <Image
            src={iconUrl}
            alt={brand.shortName}
            fill
            unoptimized
            className="object-contain p-1"
            onError={() => setImgFailed(true)}
            onLoad={(event) => {
              const src = event.currentTarget.currentSrc || event.currentTarget.src;
              // Google's default globe favicon is 16px — prefer initials instead.
              if (src.includes("google.com/s2/favicons") && event.currentTarget.naturalWidth <= 16) {
                setImgFailed(true);
              }
            }}
          />
        ) : brand.initials ? (
          <span
            className={cn(
              "text-[10px] font-bold leading-none",
              selected ? "text-primary" : "text-foreground"
            )}
            style={selected ? undefined : { color: brand.color }}
          >
            {brand.initials}
          </span>
        ) : (
          <Building2 className="size-4 text-muted-foreground" />
        )}
      </span>
      {showName ? (
        <span className={cn("min-w-0 truncate", selected && "text-primary-foreground")}>
          {brand.shortName}
        </span>
      ) : null}
    </span>
  );
}
