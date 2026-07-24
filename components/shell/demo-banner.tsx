"use client";

import * as React from "react";
import Link from "next/link";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Dismissible strip inviting guests (and local demo browsing) to log in or sign up. */
export function DemoBanner() {
  const [hidden, setHidden] = React.useState(false);
  if (hidden) return null;

  return (
    <div className="flex items-center gap-2 border-b border-chart-3/20 bg-chart-3/10 px-4 py-2 text-sm text-foreground sm:px-6">
      <Info className="size-4 shrink-0 text-chart-3" />
      <p className="flex-1">
        <span className="font-medium">You&apos;re browsing as a guest.</span>{" "}
        <span className="text-muted-foreground">
          Sign in or create a free account to track your own portfolio.
        </span>
      </p>
      <Button asChild variant="outline" size="sm" className="shrink-0">
        <Link href="/login">Log in</Link>
      </Button>
      <Button asChild size="sm" className="shrink-0">
        <Link href="/signup">Sign up</Link>
      </Button>
      <button
        onClick={() => setHidden(true)}
        className="rounded p-1 text-muted-foreground hover:bg-chart-3/10 hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
