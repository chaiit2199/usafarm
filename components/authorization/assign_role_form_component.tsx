"use client";

import { useState, useEffect, type ChangeEvent, type FormEvent } from "react";

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

type AssignRolePayload = AssignUserAccessInput;

function readAssignForm(
  data: FormData,
  fallbackUserId: number | string | undefined,
  roles: Role[],
  requireScope: boolean,
  requireTargets: boolean,
): AssignRolePayload | null {
  const userIdRaw = String(data.get("user_id") ?? fallbackUserId ?? "").trim();
  const userId = Number(userIdRaw);
  const roleId = Number(String(data.get("role_id") ?? "").trim());
  const scopeType = String(data.get("scope_type") ?? "").trim();
  const reason = String(data.get("reason") ?? "").trim();
  const targetIds = data
    .getAll("scope_target_ids")
    .map((value) => Number(value))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (!Number.isInteger(userId) || userId <= 0) return null;
  if (!Number.isInteger(roleId) || roleId <= 0 || !reason) return null;
  if (requireScope && !scopeType) return null;
  if (requireTargets && targetIds.length === 0) return null;
  if (!roles.some((role) => role.id === roleId)) return null;

  return {
    user_id: userId,
    reason,
    permissions: [
      {
        role_id: roleId,
        scope_type: scopeType || "ALL",
        target_ids: targetIds,
      },
    ],
  };
}

function initialAllowedScopes(user: User | null, roles: Role[]) {
  if (!user || user.role == null || user.role === "") return [];
  return roles.find((role) => String(role.id) === String(user.role))?.allowed_scope_types ?? [];
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
  const [selectedScope, setSelectedScope] = useState("");
  const [scopeTargets, setScopeTargets] = useState<ScopeTarget[]>([]);
  const [isTargetsLoading, setIsTargetsLoading] = useState(false);

  // Prefill từ GET /users/:id/access (role + scope + kho đã gán)
  const [selectedRoleId, setSelectedRoleId] = useState(
    user?.role != null && user.role !== "" ? String(user.role) : "",
  );
  const [selectedTargetIds, setSelectedTargetIds] = useState<number[]>([]);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    // Load quyền đã gán → chọn sẵn role / scope / targets trên form
    void fetchUserAccess(Number(user.id)).then(async (data) => {
      if (cancelled) return;

      const assigned = data.user.roles[0];
      if (!assigned) return;

      const catalogRole = roles.find((role) => role.id === assigned.id);
      setSelectedRoleId(String(assigned.id));
      setAllowedScopes(catalogRole?.allowed_scope_types ?? []);
      setSelectedScope(assigned.scope_type);
      setSelectedTargetIds(assigned.targets.map((t) => t.id));

      // Scope kiểu WAREHOUSE/AGENCY cần list checkbox từ API
      if (!SCOPE_TARGET_PATHS[assigned.scope_type]) return;

      setIsTargetsLoading(true);
      try {
        const list = await fetchScopeTargets(assigned.scope_type);
        if (!cancelled) setScopeTargets(list);
      } catch (error) {
        if (!cancelled) {
          setScopeTargets([]);
          putFlash("error", error instanceof Error ? error.message : "Không tải được danh sách phạm vi", 1500);
        }
      } finally {
        if (!cancelled) setIsTargetsLoading(false);
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
    setSelectedScope("");
    setScopeTargets([]);
    setSelectedTargetIds([]);
  }

  async function handleScopeChange(event: ChangeEvent<HTMLSelectElement>) {
    const scopeType = event.target.value;
    setSelectedScope(scopeType);
    setScopeTargets([]);
    setSelectedTargetIds([]);

    if (!scopeType || !SCOPE_TARGET_PATHS[scopeType]) return;

    setIsTargetsLoading(true);
    try {
      setScopeTargets(await fetchScopeTargets(scopeType));
    } catch (error) {
      putFlash("error", error instanceof Error ? error.message : "Không tải được danh sách phạm vi", 1500);
      setScopeTargets([]);
    } finally {
      setIsTargetsLoading(false);
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const requireTargets = scopeTargets.length > 0;

    // Checkbox group không dùng HTML required — bắt buộc chọn ≥ 1 khi có list kho/hãng
    if (requireTargets) {
      const checked = formData.getAll("scope_target_ids").filter(Boolean);
      if (checked.length === 0) {
        putFlash("error", "Vui lòng chọn ít nhất một đối tượng được truy cập", 1500);
        return;
      }
    }

    const formValues = readAssignForm(
      formData,
      user?.id,
      roles,
      allowedScopes.length > 0,
      requireTargets,
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

    const assignedUser =
      user ?? users.find((item) => Number(item.id) === payload.user_id) ?? null;
    const displayName = assignedUser?.full_name ?? `user #${payload.user_id}`;

    setIsConfirmOpen(false);
    onClose();
    putFlash("success", `Đã cập nhật phân quyền cho ${displayName}`, 2000);
  }

  const formKey = user ? String(user.id ?? user.username) : "new-assign";
  const defaultUserId = user?.id != null ? String(user.id) : "";
  const targetPath = selectedScope ? SCOPE_TARGET_PATHS[selectedScope] : undefined;
  // key remount SelectField vì defaultValue chỉ áp dụng lần mount đầu
  const prefillKey = `${selectedRoleId}:${selectedScope}`;

  return (
    <>
      <Modal
        id="assign-role-modal"
        show
        title="Gán người dùng vào vai trò"
        subtitle="Phạm vi bị giới hạn theo danh sách vai trò đã cho phép."
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
            <div className="col-span-2">
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
            </div>

            <SelectField
              key={`role-${prefillKey}`}
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
              <SelectField
                key={`scope-${prefillKey}`}
                id="assign-role-scope"
                name="scope_type"
                label={<RequiredLabel>Phạm vi được truy cập</RequiredLabel>}
                defaultValue={selectedScope}
                required
                onChange={handleScopeChange}
              >
                <option value="" disabled>
                  Chọn phạm vi
                </option>
                {allowedScopes.map((scope) => (
                  <option key={scope} value={scope}>
                    {scopeTypeLabel(scope)}
                  </option>
                ))}
              </SelectField>
            )}

            {isTargetsLoading && (
              <p className="auth-targets__hint md:col-span-2">Đang tải danh sách…</p>
            )}

            {!isTargetsLoading && scopeTargets.length > 0 && targetPath && (
              <div className="auth-targets md:col-span-2">
                <p className="auth-targets__title">
                  <RequiredLabel>{SCOPE_TARGET_TITLE[selectedScope] ?? "Đối tượng được truy cập"}</RequiredLabel>
                </p>
                <div className="auth-targets__list">
                  {scopeTargets.map((target) => (
                    <label key={target.id} className="auth-targets__item">
                      <input
                        type="checkbox"
                        name="scope_target_ids"
                        value={target.id}
                        // Tick kho/hãng đã có trong access.targets
                        defaultChecked={selectedTargetIds.includes(target.id)}
                        className="core_input--checkbox"
                      />
                      <span className="auth-targets__body">
                        <span className="auth-targets__name">{target.name}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

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
