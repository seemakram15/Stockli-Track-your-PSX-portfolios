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
  const iconUrl = logoUrl ?? amcIconUrl(brand);
  const dimension = size === "sm" ? "size-7" : size === "lg" ? "size-10" : "size-8";

  return (
    <span className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-lg border shadow-sm",
          dimension,
          selected ? "border-primary-foreground/30 bg-primary-foreground" : "border-border bg-background"
        )}
        style={{ backgroundColor: selected ? undefined : `${brand.color}14` }}
      >
        {iconUrl ? (
          <span
            aria-hidden
            className="size-5 bg-contain bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${iconUrl})` }}
          />
        ) : brand.initials ? (
          <span
            className={cn(
              "text-[10px] font-bold leading-none",
              selected ? "text-primary" : "text-foreground"
            )}
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
