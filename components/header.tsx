"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Icon } from "@/components/icon";
import { getHeaderConfig } from "@/lib/dashboard/navbar";
import { emitHeaderAction } from "@/lib/dashboard/header-actions";

export function DashboardHeader() {
  const pathname = usePathname();
  const meta = getHeaderConfig(pathname);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setQuery("");
  }, [pathname]);

  function submitSearch() {
    emitHeaderAction({ action: "search", page: pathname, query });
  }

  return (
    <header className="header" id="header">
      <div className="header__left">
        <p className="text-2xl font-medium">{meta.title}</p>
      </div>

      <div className="header__actions" id="header-actions">
        {meta.search && (
          <form
            id="header-search-form"
            onSubmit={(event) => {
              event.preventDefault();
              submitSearch();
            }}
          >
            <div className="header__search">
              <input
                id="header-search"
                name="query"
                type="text"
                className="header__search-input"
                placeholder="Search"
                autoComplete="off"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              {query !== "" && (
                <button
                  type="button"
                  id="header-search-clear"
                  className="header__search-clear absolute right-11"
                  aria-label="Xóa tìm kiếm"
                  onClick={() => {
                    setQuery("");
                    emitHeaderAction({ action: "search", page: pathname, query: "" });
                  }}
                >
                  <Icon name="hero-x-mark" className="size-4" />
                </button>
              )}
              <button type="submit" id="header-search-submit" className="header__search-submit">
                <Icon name="hero-magnifying-glass" className="size-5" />
              </button>
            </div>
          </form>
        )}

        {meta.authorization && (
          <button
            type="button"
            id="header-authorization"
            className="btn btn--primary"
            onClick={() => emitHeaderAction({ action: "authorization", page: pathname })}
          >
            <Icon name="hero-shield-check" className="size-4" />
            Phân quyền
          </button>
        )}

        {meta.create && (
          <button
            type="button"
            id="header-create"
            className="btn btn--primary"
            onClick={() => emitHeaderAction({ action: "create", page: pathname })}
          >
            <Icon name="hero-plus" className="size-4" />
            Tạo mới
          </button>
        )}

        {meta.export && (
          <button
            type="button"
            id="header-export"
            className="btn btn--primary"
            onClick={() => emitHeaderAction({ action: "export", page: pathname })}
          >
            <Icon name="hero-arrow-down-tray" className="size-4" />
            Xuất báo cáo
          </button>
        )}

        {meta.filter && (
          <button
            type="button"
            id="header-filter"
            className="btn btn--primary"
            onClick={() => emitHeaderAction({ action: "filter", page: pathname })}
          >
            <Icon name="hero-adjustments-horizontal" className="size-4" />
            Bộ lọc
          </button>
        )}
      </div>
    </header>
  );
}
