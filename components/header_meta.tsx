"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";

import type { HeaderPageOptions } from "@/lib/dashboard/navbar";

type HeaderMetaContextValue = {
  options: HeaderPageOptions | null;
  setOptions: (next: HeaderPageOptions | null) => void;
};

const HeaderMetaContext = createContext<HeaderMetaContextValue | null>(null);

export function HeaderMetaProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<HeaderPageOptions | null>(null);
  return (
    <HeaderMetaContext.Provider value={{ options, setOptions }}>
      {children}
    </HeaderMetaContext.Provider>
  );
}

function useHeaderMeta() {
  const ctx = useContext(HeaderMetaContext);
  if (!ctx) {
    throw new Error("useHeaderMeta must be used within HeaderMetaProvider");
  }
  return ctx;
}

/** Header reads page overrides (breadcrumb + action buttons). */
export function useHeaderPageOptions() {
  return useHeaderMeta().options;
}

/** Page declares breadcrumb / header buttons for the current route. */
export function HeaderPageMeta({
  href,
  subpage,
  export: canExport,
  create,
  filter,
  search,
  authorization,
}: HeaderPageOptions) {
  const { setOptions } = useHeaderMeta();

  useLayoutEffect(() => {
    setOptions({
      href,
      subpage,
      export: canExport,
      create,
      filter,
      search,
      authorization,
    });
    return () => setOptions(null);
  }, [setOptions, href, subpage, canExport, create, filter, search, authorization]);

  return null;
}
