"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Next.js client navigations can preserve the previous page's scroll Y. On a shorter
 * page (e.g. PDP after a long homepage), that reads as an instant jump toward the bottom.
 */
export function ScrollToTopOnRoute() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);

  return null;
}
