"use client";

import { useEffect, useState } from "react";

import { EmptyData, Pagination, TableHead, TableLoading } from "@/components/core_component";
import { Icon } from "@/components/icon";
import { Tab } from "@/components/tab";
import { UserAvatar } from "@/components/user-components";
import { filterUsers } from "@/lib/api/users";
import type { Role, User } from "@/lib/api/types";
import { UserStatus, userStatusMeta } from "@/lib/constants";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { formatDateVi } from "@/lib/format/date";
import { AssignRoleFormComponent } from "./assign_role_form_component";

const ACTIVE_STATUS_TABS = [{ value: UserStatus.Active, label: "Đang hoạt động" }] as const;

export function AuthorizationComponent({ roles }: { roles: Role[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [users, setUsers] = useState<User[] | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  function openForm(user: User | null) {
    setSelectedUser(user);
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setSelectedUser(null);
  }

  useEffect(() => {
    return subscribeHeaderAction("/authorization", (detail) => {
      if (detail.action === "authorization") openForm(null);
      if (detail.action === "search") {
        setSearch(detail.query ?? "");
        setPage(1);
      }
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    filterUsers({
      search: search.trim() || undefined,
      status: UserStatus.Active,
      page,
      page_size: pageSize,
    }).then((result) => {
      if (cancelled || !result.ok) return;
      setUsers(result.data ?? []);
      const total = result.meta?.total ?? result.data?.length ?? 0;
      const size = result.meta?.page_size ?? pageSize;
      setTotalPages(Math.max(1, Math.ceil(total / size)));
    });

    return () => {
      cancelled = true;
    };
  }, [search, page, pageSize]);

  return (
    <>
      {isFormOpen && (
        <AssignRoleFormComponent user={selectedUser} users={users ?? []} roles={roles} onClose={closeForm} />
      )}

      <section className="section" id="admin-authorization-section">
        <div className="section-table mb-6">
          <Tab tabs={ACTIVE_STATUS_TABS} activeTab={UserStatus.Active} />

          {users === null ? (
            <TableLoading />
          ) : users.length === 0 ? (
            <EmptyData title="Không có nhân viên" description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm." />
          ) : (
            <div className="overview-table-wrap">
              <div className="overview-table-inner">
                <table className="overview-table min-w-[1400px]" id="authorization-table">
                  <colgroup>
                    <col style={{ width: "21%" }} />
                    <col style={{ width: "12.5%" }} />
                    <col style={{ width: "12.5%" }} />
                    <col style={{ width: "12.5%" }} />
                    <col style={{ width: "12.5%" }} />
                    <col style={{ width: "12.5%" }} />
                    <col style={{ width: "12.5%" }} />
                    <col style={{ width: "4%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <TableHead icon="hero-users">Tên người dùng</TableHead>
                      <TableHead icon="hero-tag">Trạng thái</TableHead>
                      <TableHead icon="hero-at-symbol">Tên đăng nhập</TableHead>
                      <TableHead icon="hero-phone">Số điện thoại</TableHead>
                      <TableHead icon="hero-building-office-2">Phòng ban</TableHead>
                      <TableHead icon="hero-calendar-days">Ngày tạo</TableHead>
                      <TableHead icon="hero-calendar-days">Ngày hiệu lực</TableHead>
                      <th className="actions" />
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => {
                      const meta = userStatusMeta(user.status);

                      return (
                        <tr
                          key={user.id}
                          id={`authorization-row-${user.id}`}
                          className="cursor-pointer"
                          onClick={() => openForm(user)}
                        >
                          <td>
                            <div className="admin-user">
                              <UserAvatar fullname={user.full_name} />
                              <div>
                                <p className="admin-user__name mb-1">{user.full_name}</p>
                                <p className="admin-user__email">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`status status--${meta.kind}`}>{meta.label}</span>
                          </td>
                          <td className="overview-table__muted">{user.username}</td>
                          <td className="overview-table__muted">{user.phone}</td>
                          <td className="overview-table__muted">{user.department?.name ?? "—"}</td>
                          <td className="overview-table__muted">{formatDateVi(user.created_at)}</td>
                          <td className="overview-table__muted">{formatDateVi(user.activated_at)}</td>
                          <td className="actions">
                            <div className="admin-actions">
                              <button type="button" className="admin-actions__btn" aria-label="Chỉnh sửa">
                                <Icon name="hero-pencil-square" className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
        </div>
      </section>
    </>
  );
}
