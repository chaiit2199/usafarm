"use client";

import type { PackagingGroup } from "@/lib/api/types";

export function PackagingGroupTags({ groups }: { groups: PackagingGroup[] }) {
  const active = groups.filter((group) => group.status === 1 || group.status == null);
  if (active.length === 0) {
    return <span className="overview-table__muted">—</span>;
  }

  return (
    <div className="flex flex-wrap items-center gap-1">
      {active.map((group) => (
        <span key={group.id} className="dash-tag" title={group.name}>
          {group.code}
        </span>
      ))}
    </div>
  );
}

export function PackagingGroupChecklist({
  groups,
  selectedIds = [],
  name = "group_ids",
  readOnly = false,
}: {
  groups: PackagingGroup[];
  selectedIds?: number[];
  name?: string;
  readOnly?: boolean;
}) {
  const selected = new Set(selectedIds);

  if (groups.length === 0) {
    return <p className="overview-table__muted text-sm">Chưa có nhóm bao bì.</p>;
  }

  return (
    <div className="auth-targets">
      <div className="auth-targets__list">
        {groups.map((group) => (
          <label key={group.id} className="auth-targets__item">
            <input
              type="checkbox"
              name={name}
              value={group.id}
              defaultChecked={selected.has(group.id)}
              disabled={readOnly}
              className="core_input--checkbox"
            />
            <span className="auth-targets__body">
              <span className="auth-targets__name">{group.code}</span>
              {group.name !== group.code && (
                <span className="overview-table__muted text-xs">{group.name}</span>
              )}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
