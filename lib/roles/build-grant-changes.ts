import type { RoleGrant } from "@/lib/api/types";

export type GrantUpsert = {
  permission_id: number;
};

export type GrantChanges = {
  remove: number[];
  upsert: GrantUpsert[];
};

/** So sánh grants hiện tại với danh sách permission_id mới chọn. */
export function buildGrantChanges(before: RoleGrant[], selectedPermissionIds: number[]): GrantChanges {
  const beforeIds = new Set(before.map((grant) => grant.permission_id));
  const afterIds = new Set(selectedPermissionIds);

  const remove = [...beforeIds].filter((id) => !afterIds.has(id));
  const upsert = [...afterIds]
    .filter((id) => !beforeIds.has(id))
    .map((permission_id) => ({ permission_id }));

  return { remove, upsert };
}
