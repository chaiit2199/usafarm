"use client";

import { useEffect, useState } from "react";

import type { Department } from "@/lib/api/me";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { EditDepartmentComponent } from "./edit_department_component";
import { CreateDepartmentComponent } from "./create_department_component";

export function DepartmentsComponent({
  initialDepartments,
  initialTotalPages = 1,
}: {
  initialDepartments: Department[];
  initialTotalPages?: number;
}) {
  const [search, setSearch] = useState("");
  const [reloadAt, setReloadAt] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    return subscribeHeaderAction("/departments", (detail) => {
      if (detail.action === "create") setIsCreateOpen(true);
      if (detail.action === "search") setSearch(detail.query ?? "");
    });
  }, []);

  return (
    <>
      <EditDepartmentComponent
        search={search}
        reloadAt={reloadAt}
        initialDepartments={initialDepartments}
        initialTotalPages={initialTotalPages}
      />
      {isCreateOpen && (
        <CreateDepartmentComponent
          onClose={() => setIsCreateOpen(false)}
          onCreated={() => setReloadAt((value) => value + 1)}
        />
      )}
    </>
  );
}
