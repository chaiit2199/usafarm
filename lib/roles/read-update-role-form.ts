import type { UpdateRoleInput } from "@/lib/validate/roles";
import type { Role } from "@/lib/api/types";

import { buildGrantChanges } from "./build-grant-changes";

export function readUpdateRoleForm(
  form: FormData,
  role: Role,
  grantedPermissionIds: number[],
): UpdateRoleInput | null {
  const name = String(form.get("name") ?? "").trim();
  if (!name) return null;

  const selectedPermissionIds = form
    .getAll("permission_ids")
    .map((value) => Number(value))
    .filter((id) => Number.isInteger(id) && id > 0);

  const { remove, upsert } = buildGrantChanges(
    grantedPermissionIds.map((permission_id) => ({ permission_id, permission_code: "" })),
    selectedPermissionIds,
  );

  return {
    id: role.id,
    name,
    description: String(form.get("description") ?? "").trim(),
    remove,
    upsert,
  };
}
