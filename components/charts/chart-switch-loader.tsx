"use client";

export function ChartSwitchLoader({
  label,
  accentClassName = "border-primary/30 border-t-primary",
  className = "h-full min-h-[180px]",
}: {
  label: string;
  accentClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-xl bg-muted/20 ${className}`}
    >
      <div className={`size-8 animate-spin rounded-full border-2 ${accentClassName}`} />
      <p className="text-sm text-muted-foreground">Loading {label}…</p>
    </div>
  );
}
