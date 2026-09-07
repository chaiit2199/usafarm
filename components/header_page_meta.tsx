"use client";

import { useLayoutEffect } from "react";

import { setHeaderPageOptions } from "@/lib/dashboard/header-page-meta";
import type { HeaderPageOptions } from "@/lib/dashboard/navbar";

/** Declares header breadcrumb for the current page. */
export function HeaderPageMeta({ href, subpage }: HeaderPageOptions) {
  useLayoutEffect(() => {
    setHeaderPageOptions({ href, subpage });
    return () => setHeaderPageOptions(null);
  }, [href, subpage]);

  return null;
}
