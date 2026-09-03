"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";

import { Icon } from "@/components/icon";
import { Modal } from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { RequiredLabel, SelectField } from "@/components/form-fields";
import { fetchScopeTargets } from "@/lib/api/roles";
import { assignUserAccess, fetchUserAccess, type AssignUserAccessInput } from "@/lib/api/users";
import type { Role, ScopeTarget, User } from "@/lib/api/types";
import { putFlash } from "@/lib/flash/flash";

const SCOPE_TYPE_LABELS: Record<string, string> = {
  SELF: "Cá nhân",
  AGENCY: "Theo hãng",
  WAREHOUSE: "Theo kho",
  ALL: "Toàn hệ thống",
};

const SCOPE_TARGET_TITLE: Record<string, string> = {
  WAREHOUSE: "Kho được truy cập",
  AGENCY: "Hãng được truy cập",
};

const SCOPE_TARGET_PATHS: Record<string, string> = {
  WAREHOUSE: "warehouses",
  AGENCY: "agencies",
};

function scopeTypeLabel(code: string) {
  return SCOPE_TYPE_LABELS[code] ?? code;
}

function requiresTargets(scope: string) {
  return Boolean(SCOPE_TARGET_PATHS[scope]);
}

type AssignRolePayload = AssignUserAccessInput;

function initialAllowedScopes(user: User | null, roles: Role[]) {
  if (!user || user.role == null || user.role === "") return [];
  return roles.find((role) => String(role.id) === String(user.role))?.allowed_scope_types ?? [];
}

function buildPayload(
  data: FormData,
  fallbackUserId: number | string | undefined,
  roles: Role[],
  selectedScopes: string[],
  selectedTargetIdsByScope: Record<string, number[]>,
): AssignRolePayload | null {
  const userId = Number(String(data.get("user_id") ?? fallbackUserId ?? "").trim());
  const roleId = Number(String(data.get("role_id") ?? "").trim());
  const reason = String(data.get("reason") ?? "").trim();

  if (!Number.isInteger(userId) || userId <= 0) return null;
  if (!Number.isInteger(roleId) || roleId <= 0 || !reason) return null;
  if (!roles.some((role) => role.id === roleId)) return null;
  if (selectedScopes.length === 0) return null;

  return {
    user_id: userId,
    reason,
    permissions: selectedScopes.map((scope_type) => ({
      role_id: roleId,
      scope_type,
      target_ids: requiresTargets(scope_type) ? (selectedTargetIdsByScope[scope_type] ?? []) : [],
    })),
  };
}

export function AssignRoleFormComponent({
  user,
  users,
  roles,
  onClose,
}: {
  user: User | null;
  users: User[];
  roles: Role[];
  onClose: () => void;
}) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [payload, setPayload] = useState<AssignRolePayload | null>(null);
  const [allowedScopes, setAllowedScopes] = useState<string[]>(() => initialAllowedScopes(user, roles));
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [targetsByScope, setTargetsByScope] = useState<Record<string, ScopeTarget[]>>({});
  const [selectedTargetIdsByScope, setSelectedTargetIdsByScope] = useState<Record<string, number[]>>({});
  const [loadingScopes, setLoadingScopes] = useState<Record<string, boolean>>({});
  const [selectedRoleId, setSelectedRoleId] = useState(
    user?.role != null && user.role !== "" ? String(user.role) : "",
  );

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    void fetchUserAccess(Number(user.id)).then(async (data) => {
      if (cancelled) return;

      const assignedRoles = data.user.roles;
      if (assignedRoles.length === 0) return;

      const primary = assignedRoles[0];
      const catalogRole = roles.find((role) => role.id === primary.id);
      const scopes = [...new Set(assignedRoles.map((role) => role.scope_type).filter(Boolean))];
      const nextTargets: Record<string, number[]> = {};

      for (const assigned of assignedRoles) {
        nextTargets[assigned.scope_type] = assigned.targets.map((target) => target.id);
      }

      setSelectedRoleId(String(primary.id));
      setAllowedScopes(catalogRole?.allowed_scope_types ?? []);
      setSelectedScopes(scopes);
      setSelectedTargetIdsByScope(nextTargets);

      const scopesNeedingTargets = scopes.filter(requiresTargets);
      if (scopesNeedingTargets.length === 0) return;

      setLoadingScopes(Object.fromEntries(scopesNeedingTargets.map((scope) => [scope, true])));
      try {
        const entries = await Promise.all(
          scopesNeedingTargets.map(async (scope) => {
            const list = await fetchScopeTargets(scope);
            return [scope, list] as const;
          }),
        );
        if (!cancelled) {
          setTargetsByScope((current) => ({
            ...current,
            ...Object.fromEntries(entries),
          }));
        }
      } catch (error) {
        if (!cancelled) {
          putFlash("error", error instanceof Error ? error.message : "Không tải được danh sách phạm vi", 1500);
        }
      } finally {
        if (!cancelled) {
          setLoadingScopes(Object.fromEntries(scopesNeedingTargets.map((scope) => [scope, false])));
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id, roles]);

  function handleRoleChange(event: ChangeEvent<HTMLSelectElement>) {
    const role = roles.find((item) => String(item.id) === event.target.value) ?? null;
    setSelectedRoleId(event.target.value);
    setAllowedScopes(role?.allowed_scope_types ?? []);
    setSelectedScopes([]);
    setTargetsByScope({});
    setSelectedTargetIdsByScope({});
    setLoadingScopes({});
  }

  async function ensureTargetsLoaded(scope: string) {
    if (!requiresTargets(scope) || targetsByScope[scope]) return;

    setLoadingScopes((current) => ({ ...current, [scope]: true }));
    try {
      const list = await fetchScopeTargets(scope);
      setTargetsByScope((current) => ({ ...current, [scope]: list }));
    } catch (error) {
      putFlash("error", error instanceof Error ? error.message : "Không tải được danh sách phạm vi", 1500);
      setTargetsByScope((current) => ({ ...current, [scope]: [] }));
    } finally {
      setLoadingScopes((current) => ({ ...current, [scope]: false }));
    }
  }

  function toggleScope(scope: string) {
    const isSelected = selectedScopes.includes(scope);

    if (isSelected) {
      setSelectedScopes((current) => current.filter((item) => item !== scope));
      setSelectedTargetIdsByScope((current) => {
        const next = { ...current };
        delete next[scope];
        return next;
      });
      return;
    }

    // Mode 1: ALL (hoặc scope không cần targets) — chỉ chọn một mình
    if (!requiresTargets(scope)) {
      setSelectedScopes([scope]);
      setSelectedTargetIdsByScope({});
      return;
    }

    // Mode 2: WAREHOUSE / AGENCY — bỏ ALL/SELF, có thể chọn nhiều
    setSelectedScopes((current) => [...current.filter(requiresTargets), scope]);
    void ensureTargetsLoaded(scope);
  }

  function toggleTarget(scope: string, targetId: number) {
    setSelectedTargetIdsByScope((current) => {
      const selected = current[scope] ?? [];
      const next = selected.includes(targetId)
        ? selected.filter((id) => id !== targetId)
        : [...selected, targetId];
      return { ...current, [scope]: next };
    });
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (allowedScopes.length > 0 && selectedScopes.length === 0) {
      putFlash("error", "Vui lòng chọn ít nhất một phạm vi", 1500);
      return;
    }

    for (const scope of selectedScopes) {
      if (!requiresTargets(scope)) continue;
      if ((selectedTargetIdsByScope[scope] ?? []).length === 0) {
        putFlash("error", `Vui lòng chọn ít nhất một đối tượng cho ${scopeTypeLabel(scope)}`, 1500);
        return;
      }
    }

    const formValues = buildPayload(
      new FormData(event.currentTarget),
      user?.id,
      roles,
      selectedScopes,
      selectedTargetIdsByScope,
    );
    if (!formValues) return;

    setPayload(formValues);
    setIsConfirmOpen(true);
  }

  async function confirmAssign() {
    if (!payload) return;

    const result = await assignUserAccess(payload);
    if (!result.ok) {
      setIsConfirmOpen(false);
      putFlash("error", result.message, 1500);
      return;
    }

    const assignedUser = user ?? users.find((item) => Number(item.id) === payload.user_id) ?? null;
    const displayName = assignedUser?.full_name ?? `user #${payload.user_id}`;

    setIsConfirmOpen(false);
    onClose();
    putFlash("success", `Đã cập nhật phân quyền cho ${displayName}`, 2000);
  }

  const formKey = user ? String(user.id ?? user.username) : "new-assign";
  const defaultUserId = user?.id != null ? String(user.id) : "";
  const targetScopes = selectedScopes.filter(requiresTargets);

  return (
    <>
      <Modal
        id="assign-role-modal"
        show
        title="Gán người dùng vào vai trò"
        subtitle="Chọn Toàn hệ thống, hoặc kết hợp Theo kho / Theo hãng."
        closeable={!isConfirmOpen}
        width="xl"
        onClose={onClose}
      >
        <form
          key={formKey}
          id="assign-role-form"
          className="core_modal__form overflow-hidden"
          autoComplete="off"
          onSubmit={handleFormSubmit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto flex-auto h-full content-start">
            <SelectField
              id="assign-role-user"
              name="user_id"
              label={<RequiredLabel>Họ và tên</RequiredLabel>}
              defaultValue={defaultUserId}
              required
            >
              <option value="" disabled>
                Chọn người dùng
              </option>
              {users.map((item) => (
                <option key={String(item.id ?? item.username)} value={String(item.id ?? item.username)}>
                  {item.full_name} - {item.username}
                </option>
              ))}
            </SelectField>

            <SelectField
              key={`role-${selectedRoleId}`}
              id="assign-role-role"
              name="role_id"
              label={<RequiredLabel>Vai trò</RequiredLabel>}
              defaultValue={selectedRoleId}
              required
              onChange={handleRoleChange}
            >
              <option value="" disabled>
                Chọn vai trò
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </SelectField>

            {allowedScopes.length > 0 && (
              <div className="core_field md:col-span-2">
                <p className="core_label">
                  <RequiredLabel>Phạm vi được truy cập</RequiredLabel>
                </p>
                <div className="auth-scope">
                  {allowedScopes.map((scope) => {
                    const isChecked = selectedScopes.includes(scope);

                    return (
                      <button
                        key={scope}
                        type="button"
                        className={["auth-scope__item", isChecked && "is-checked"].filter(Boolean).join(" ")}
                        onClick={() => toggleScope(scope)}
                      >
                        <span
                          className={["auth-permission__check", isChecked && "is-checked"].filter(Boolean).join(" ")}
                        >
                          {isChecked && <Icon name="hero-check" className="size-3.5" />}
                        </span>
                        <span className="auth-scope__name">{scopeTypeLabel(scope)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {targetScopes.map((scope) => {
              const targets = targetsByScope[scope] ?? [];
              const selectedIds = selectedTargetIdsByScope[scope] ?? [];
              const isLoading = loadingScopes[scope];

              return (
                <div key={scope} className="auth-targets md:col-span-2">
                  <p className="auth-targets__title">
                    <RequiredLabel>{SCOPE_TARGET_TITLE[scope] ?? scopeTypeLabel(scope)}</RequiredLabel>
                  </p>
                  {isLoading ? (
                    <p className="auth-targets__hint">Đang tải danh sách…</p>
                  ) : targets.length === 0 ? (
                    <p className="auth-targets__hint">Không có đối tượng để chọn.</p>
                  ) : (
                    <div className="auth-targets__list">
                      {targets.map((target) => {
                        const checked = selectedIds.includes(target.id);

                        return (
                          <label key={target.id} className="auth-targets__item">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleTarget(scope, target.id)}
                              className="core_input--checkbox"
                            />
                            <span className="auth-targets__body">
                              <span className="auth-targets__name">{target.name}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="core_field md:col-span-2">
              <label htmlFor="assign-role-reason" className="core_label">
                <RequiredLabel>Lý do thay đổi</RequiredLabel>
              </label>
              <textarea
                id="assign-role-reason"
                name="reason"
                rows={3}
                required
                placeholder="Nhập lý do thay đổi phân quyền"
                className="core_input core_input--textarea w-full"
              />
            </div>
          </div>

          <div className="core_modal__actions">
            <button type="button" className="core_button core_button--secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="core_button core_button--primary">
              Xác nhận
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        id="assign-role-confirm-modal"
        show={isConfirmOpen}
        title="Xác nhận cập nhật phân quyền"
        width="md"
        className="core_modal--stacked"
        onClose={() => setIsConfirmOpen(false)}
      >
        <form className="core_modal__actions" action={confirmAssign}>
          <button
            type="button"
            className="core_button core_button--secondary"
            onClick={() => setIsConfirmOpen(false)}
          >
            Hủy
          </button>
          <FormSubmitButton>Xác nhận</FormSubmitButton>
        </form>
      </Modal>
    </>
  );
}
