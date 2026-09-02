"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "@/lib/api/me";
import {
  createRoleSchema,
  rejectRoleSchema,
  roleIdSchema,
  updateRoleSchema,
  type CreateRoleInput,
  type UpdateRoleInput,
} from "@/lib/validate/roles";
import { runServerAction } from "@/lib/server-actions";
import { client, HttpError } from "@/lib/http/client";
import type { RolePermissionsResponse, RolesResponse, ScopeTarget, ScopeTargetsResponse } from "@/lib/api/types";

export type { CreateRoleInput, UpdateRoleInput };

export type FilterRolesParams = {
  search?: string;
  status?: number;
  page?: number;
  page_size?: number;
};

const SCOPE_TARGET_PATHS: Record<string, string> = {
  WAREHOUSE: "warehouses",
  AGENCY: "agencies",
};

export async function createRole(payload: CreateRoleInput) {
  return runServerAction(createRoleSchema, payload, "Không thể tạo nhóm quyền", async (params) => {
    await client.post("/api/v1/roles", params);
    revalidatePath("/roles");
    return { ok: true as const };
  });
}

export async function updateRole(payload: UpdateRoleInput) {
  return runServerAction(updateRoleSchema, payload, "Không thể cập nhật nhóm quyền", async (params) => {
    const { id, name, description, remove, upsert } = params;

    await client.patch(`/api/v1/roles/${id}/permissions`, {
      remove,
      upsert,
    });

    revalidatePath("/roles");
    return { ok: true as const };
  });
}

export async function approveRole(payload: { id: number }) {
  return runServerAction(roleIdSchema, payload, "Không thể duyệt nhóm quyền", async ({ id }) => {
    await client.post(`/api/v1/roles/${id}/approve`);
    revalidatePath("/roles");
    return { ok: true as const };
  });
}

export async function rejectRole(payload: { id: number; reason: string }) {
  return runServerAction(rejectRoleSchema, payload, "Không thể từ chối nhóm quyền", async ({ id, reason }) => {
    await client.post(`/api/v1/roles/${id}/reject`, { reason });
    revalidatePath("/roles");
    return { ok: true as const };
  });
}

export async function fetchRolePermissions(roleId: number) {
  await requireCurrentUser();
  return (await client.get<RolePermissionsResponse>(`/api/v1/roles/${roleId}/permissions`)).data;
}

export async function fetchScopeTargets(scopeType: string): Promise<ScopeTarget[]> {
  const path = SCOPE_TARGET_PATHS[String(scopeType).toUpperCase()];
  if (!path) return [];

  await requireCurrentUser();

  try {
    return (await client.get<ScopeTargetsResponse>(`/api/v1/${path}`)).data ?? [];
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) return [];
    throw error;
  }
}

export async function filterRoles(params: FilterRolesParams = {}) {
  const response = await client.get<RolesResponse>("/api/v1/roles", { params });
  return { ok: true as const, data: response.data, meta: response.meta };
}
 