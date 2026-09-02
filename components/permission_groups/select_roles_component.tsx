"use client";

import { useState } from "react";

import { Icon } from "@/components/icon";
import type { Permission } from "@/lib/api/types";

type PermissionGroup = {
  id: string;
  name: string;
  actions: Permission[];
};

function uniqueSortedIds(ids: number[]) {
  return [...new Set(ids)].sort((a, b) => a - b);
}

function groupPermissions(permissions: Permission[]): PermissionGroup[] {
  const groups = new Map<string, PermissionGroup>();

  for (const permission of permissions) {
    const group = groups.get(permission.module_code) ?? {
      id: permission.module_code,
      name: permission.module_name,
      actions: [],
    };
    group.actions.push(permission);
    groups.set(permission.module_code, group);
  }

  return [...groups.values()];
}

function matchesScope(permission: Permission, scopes: string[]) {
  return (permission.allowed_scope_types ?? []).some((scope) => scopes.includes(scope));
}

export function SelectRoles({
  permissions,
  scopePermissions,
  selectedPermissionIds = [],
  readOnly = false,
}: {
  permissions: Permission[];
  scopePermissions: string[];
  selectedPermissionIds?: number[];
  readOnly?: boolean;
}) {
  const groups = groupPermissions(permissions);
  const [permissionIds, setPermissionIds] = useState(() => uniqueSortedIds(selectedPermissionIds));

  function toggleAction(id: number) {
    if (readOnly) return;
    setPermissionIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return uniqueSortedIds([...current, id]);
    });
  }

  function togglePage(group: PermissionGroup) {
    if (readOnly) return;
    const actionIds = group.actions.map((action) => action.id);
    setPermissionIds((current) => {
      const allSelected = actionIds.every((id) => current.includes(id));
      if (allSelected) return current.filter((id) => !actionIds.includes(id));
      return uniqueSortedIds([...current, ...actionIds]);
    });
  }

  return (
    <div className="auth-permission" id="permission-matrix">
      {permissionIds.map((id) => (
        <input key={id} type="hidden" name="permission_ids" value={id} />
      ))}
      <div className="auth-permission__head">
        <h3 className="auth-permission__title">Quyền truy cập</h3>
      </div>

      <div className="auth-permission__list">
        {groups.map((group) => {
          const isPageEnabled = group.actions.some((action) => matchesScope(action, scopePermissions));
          const canToggle = isPageEnabled && !readOnly;
          const actionIds = group.actions.map((action) => action.id);
          const isPageChecked =
            actionIds.length > 0 && actionIds.every((id) => permissionIds.includes(id));

          return (
            <div
              key={group.id}
              id={`permission-page-${group.id}`}
              className={["auth-permission__item", isPageEnabled && "is-enabled"].filter(Boolean).join(" ")}
            >
              <button
                type="button"
                className={[
                  "auth-permission__page",
                  isPageChecked && "is-checked",
                  !canToggle && "is-disabled",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={!canToggle}
                onClick={() => togglePage(group)}
              >
                <span
                  className={["auth-permission__check", isPageChecked && "is-checked"].filter(Boolean).join(" ")}
                >
                  {isPageChecked && <Icon name="hero-check" className="size-3.5" />}
                </span>
                <span>{group.name}</span>
              </button>

              <div className="auth-permission__actions">
                {group.actions.map((action) => {
                  const isActionEnabled = permissionIds.includes(action.id);

                  return (
                    <button
                      key={action.id}
                      type="button"
                      className={[
                        "auth-permission__action",
                        isActionEnabled && "is-checked",
                        !canToggle && "is-disabled",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      disabled={!canToggle}
                      onClick={() => toggleAction(action.id)}
                    >
                      <span
                        className={["auth-permission__check", isActionEnabled && "is-checked"].filter(Boolean).join(" ")}
                      >
                        {isActionEnabled && <Icon name="hero-check" className="size-3.5" />}
                      </span>
                      <span>{action.function_name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
