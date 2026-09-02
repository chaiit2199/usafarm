import { cache } from "react";
import { redirect } from "next/navigation";

import { client, HttpError } from "@/lib/http/client";
import type {
  CurrentUserResponse,
  DepartmentsResponse,
  RolesResponse,
  ShortRolesResponse,
  UsersResponse,
  ScopeTypesResponse,
  CatalogPermissionsResponse,
  MeAccessResponse,
} from "@/lib/api/types";

export type {
  User,
  Department,
  Role,
  RoleGrant,
  ShortRole,
  MeAccessData,
  MeAccessPermission,
  MeAccessActions,
} from "@/lib/api/types";

async function redirectOnUnauthorized<T>(load: () => Promise<T>): Promise<T> {
  try {
    return await load();
  } catch (error) {
    if (error instanceof HttpError && error.status === HttpError.Unauthorized) {
      redirect("/login");
    }

    throw error;
  }
}

export const getCurrentUser = cache(() =>
  redirectOnUnauthorized(async () => (await client.get<CurrentUserResponse>("/api/v1/me")).data.user),
);

export const requireCurrentUser = cache(async () => {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
});

export const getUsers = cache(() =>
  redirectOnUnauthorized(async () => (await client.get<UsersResponse>("/api/v1/users")).data),
);

export const getDepartments = cache(() =>
  redirectOnUnauthorized(async () => (await client.get<DepartmentsResponse>("/api/v1/departments?status=ALL")).data),
);

export const getShortRoles = cache(() =>
  redirectOnUnauthorized(async () =>
    (await client.get<ShortRolesResponse>("/api/v1/roles?view=short")).data,
  ),
);

export const getRoles = cache(() =>
  redirectOnUnauthorized(async () => (await client.get<RolesResponse>("/api/v1/roles")).data),
);

export const getScopeTypes = cache(() =>
  redirectOnUnauthorized(async () => (await client.get<ScopeTypesResponse>("/api/v1/scope-types")).data),
);

export const getPermissions = cache(() =>
  redirectOnUnauthorized(async () => (await client.get<CatalogPermissionsResponse>("/api/v1/permissions")).data),
);

export const getCurrentUserPermissions = cache(() =>
  redirectOnUnauthorized(async () => (await client.get<MeAccessResponse>("/api/v1/me/access")).data),
);