"use client";

import { useEffect, useState } from "react";

import type { Packaging, PackagingGroup } from "@/lib/api/types";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { EditPackagingComponent } from "@/components/packaging/edit_packaging_component";
import { CreatePackagingComponent } from "@/components/packaging/create_packaging_component";

export function PackagingComponent({
  initialPackagings,
  initialTotalPages = 1,
  packagingGroups,
}: {
  initialPackagings: Packaging[];
  initialTotalPages?: number;
  packagingGroups: PackagingGroup[];
}) {
  const [search, setSearch] = useState("");
  const [reloadAt, setReloadAt] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    return subscribeHeaderAction("/products/packaging", (detail) => {
      if (detail.action === "create") setIsCreateOpen(true);
      if (detail.action === "search") setSearch(detail.query ?? "");
    });
  }, []);

  return (
    <>
      <EditPackagingComponent
        search={search}
        reloadAt={reloadAt}
        initialPackagings={initialPackagings}
        initialTotalPages={initialTotalPages}
        packagingGroups={packagingGroups}
      />
      {isCreateOpen && (
        <CreatePackagingComponent
          packagingGroups={packagingGroups}
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => setReloadAt((value) => value + 1)}
        />
      )}
    </>
  );
}
