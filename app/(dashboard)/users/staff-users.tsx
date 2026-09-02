"use client";

import { useEffect, useState } from "react";

import type { Department, User } from "@/lib/api/me";
import { UsersComponent } from "@/components/users/users_component";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { CreateUserComponent } from "@/components/users/create_user_component";

export function StaffUsers({
  departments,
  initialUsers,
  initialTotalPages,
}: {
  departments: Department[];
  initialUsers: User[];
  initialTotalPages: number;
}) {
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false); 
 
    useEffect(() => {
        return subscribeHeaderAction("/users", (detail) => {
          if (detail.action === "create") setIsCreateOpen(true);
          if (detail.action === "search") setSearch(detail.query ?? "");
        });
    }, []);

  return (
    <>
        <UsersComponent
            search={search}
            departments={departments}
            initialUsers={initialUsers}
            initialTotalPages={initialTotalPages}
        />
            {isCreateOpen && (
                <CreateUserComponent
                departments={departments}
                onClose={() => setIsCreateOpen(false)}
            />
        )}
    </>
  );
}
