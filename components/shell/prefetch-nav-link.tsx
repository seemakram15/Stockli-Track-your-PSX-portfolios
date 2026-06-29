"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type PrefetchNavLinkProps = Omit<React.ComponentProps<typeof Link>, "href"> & {
  href: string;
  prefetchOnMount?: boolean;
};

export function PrefetchNavLink({
  href,
  prefetch = false,
  prefetchOnMount = true,
  onPointerEnter,
  onFocus,
  onTouchStart,
  ...props
}: PrefetchNavLinkProps) {
  const router = useRouter();
  const prefetchedRef = React.useRef(false);

  const prefetchHref = React.useCallback(() => {
    if (prefetchedRef.current) return;
    prefetchedRef.current = true;
    router.prefetch(href);
  }, [href, router]);

  React.useEffect(() => {
    if (!prefetchOnMount) return;
    prefetchHref();
  }, [prefetchHref, prefetchOnMount]);

  return (
    <Link
      {...props}
      href={href}
      prefetch={prefetch}
      onPointerEnter={(event) => {
        prefetchHref();
        onPointerEnter?.(event);
      }}
      onFocus={(event) => {
        prefetchHref();
        onFocus?.(event);
      }}
      onTouchStart={(event) => {
        prefetchHref();
        onTouchStart?.(event);
      }}
    />
  );
}
