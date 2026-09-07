"use client";

import type { ReactNode } from "react";

import { DashboardHeader } from "@/components/header";
import { HeaderMetaProvider } from "@/components/header_meta";

/** Client shell: header + page share HeaderPageMeta context. */
export function DashboardChrome({ children }: { children: ReactNode }) {
  return (
    <HeaderMetaProvider>
      <DashboardHeader />
      {children}
    </HeaderMetaProvider>
  );
}
