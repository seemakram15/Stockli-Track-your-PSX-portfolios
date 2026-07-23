import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-xl border border-border/80 bg-muted/45 px-3.5 py-2 text-sm text-foreground shadow-sm transition-[color,box-shadow,background-color,border-color] outline-none",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground/80",
        "hover:border-border hover:bg-muted/60",
        "focus-visible:border-emerald-500/55 focus-visible:bg-background focus-visible:ring-[3px] focus-visible:ring-emerald-500/20",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/30 disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20",
        "dark:bg-input/35 dark:hover:bg-input/45 dark:focus-visible:bg-input/50 dark:disabled:bg-input/25",
        "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
