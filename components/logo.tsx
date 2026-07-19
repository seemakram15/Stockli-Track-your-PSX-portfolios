"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

export function Logo({
  className,
  showText = true,
  beta = false,
}: {
  className?: string;
  showText?: boolean;
  beta?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-2.5 font-semibold", className)}>
      <StockliGlyph className="size-8" />
      {showText && (
        <span className="flex items-center gap-1.5 leading-none">
          <span className="text-lg tracking-normal">{APP_NAME}</span>
          {beta && (
            <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-500">
              Beta
            </span>
          )}
        </span>
      )}
    </span>
  );
}

export function StockliGlyph({ className }: { className?: string }) {
  const id = React.useId().replace(/:/g, "");
  const gradId = `smg-${id}`;
  const surfId = `sms-${id}`;
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="7" y1="33" x2="33" y2="7" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7dd3fc" />
          <stop offset="0.45" stopColor="#34d399" />
          <stop offset="1" stopColor="#facc15" />
        </linearGradient>
        <linearGradient id={surfId} x1="4" y1="36" x2="36" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#06120f" />
          <stop offset="1" stopColor="#12352d" />
        </linearGradient>
      </defs>
      <rect x="2.5" y="2.5" width="35" height="35" rx="10" fill={`url(#${surfId})`} />
      <rect x="3.25" y="3.25" width="33.5" height="33.5" rx="9.25" stroke="white" strokeOpacity="0.16" strokeWidth="1.5" />
      <path
        d="M13 25.1c2.7 2.1 9.5 2.1 12-.3 2.3-2.2.7-4.5-5-5.3-5.4-.8-7.1-3.2-4.7-5.6 2.4-2.5 8.6-2.5 11.7-.5"
        stroke={`url(#${gradId})`}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M11.5 27.5 17 22l4.6 3.5L29 14"
        stroke={`url(#${gradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M24.2 14H29v4.8"
        stroke={`url(#${gradId})`}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <circle cx="11.5" cy="27.5" r="2.1" fill="#7dd3fc" />
      <circle cx="21.6" cy="25.5" r="2.1" fill="#34d399" />
      <circle cx="29" cy="14" r="2.1" fill="#facc15" />
    </svg>
  );
}
