"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";

import { Tab } from "@/components/tab";
import type { Department, User } from "@/lib/api/me";
import { UserAvatar } from "@/components/user-components";
import { Icon } from "@/components/icon";
import { USER_STATUS_TABS, UserStatus, type UserStatusTabValue, readFormStatus, userStatusMeta } from "@/lib/constants";
import { FormSubmitButton } from "@/components/form-submit-button";
import { RequiredLabel, SelectField } from "@/components/form-fields";
import { Input, Modal, EmptyData, Pagination, TableHead, TableLoading } from "@/components/core_component";
import { approveUser, filterUsers, rejectUser, updateUser } from "@/lib/api/users";
import { putFlash } from "@/lib/flash/flash";
import { formatDateVi } from "@/lib/format/date";

type ConfirmAction = "update" | "approve" | "reject";

const CONFIRM_TITLE: Record<ConfirmAction, string> = {
    update: "Xác nhận cập nhật nhân viên",
    approve: "Xác nhận duyệt nhân viên",
    reject: "Xác nhận từ chối nhân viên",
};

const CONFIRM_SUCCESS: Record<ConfirmAction, string> = {
    update: "Cập nhật nhân viên thành công",
    approve: "Đã duyệt nhân viên",
    reject: "Đã từ chối nhân viên",
};

type UpdateUserEntity = {
    full_name?: string;
    phone?: string;
    email?: string;
    status?: number;
    department_id?: number;
    address?: string;
};

function readUpdateForm(data: FormData): UpdateUserEntity {
    const formValues: UpdateUserEntity = {};
    const text = (name: string) => String(data.get(name) ?? "").trim();

    const fullName = text("full_name");
    const phone = text("phone");
    const email = text("email");
    const address = text("address");
    const status = readFormStatus(data);
    const departmentId = Number(data.get("department_id"));

    if (fullName) formValues.full_name = fullName;
    if (phone) formValues.phone = phone;
    if (email) formValues.email = email;
    if (address) formValues.address = address;
    if (status !== undefined) formValues.status = status;
    if (Number.isFinite(departmentId) && departmentId > 0) formValues.department_id = departmentId;

    return formValues;
}

export function UsersComponent({
    departments,
    search,
    initialUsers,
    initialTotalPages = 1,
}: {
    departments: Department[];
    search: string;
    initialUsers: User[];
    initialTotalPages?: number;
}) {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [payload, setPayload] = useState<UpdateUserEntity | null>(null);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
    const [reloadAt, setReloadAt] = useState(0);
    const [activeTab, setActiveTab] = useState<UserStatusTabValue>("all");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(initialTotalPages);
    const [users, setUsers] = useState<User[] | null>(initialUsers);
    const skipFirstFetch = useRef(true);
    const canEdit = selectedUser?.status === UserStatus.Active;
    const isPendingApproval = selectedUser?.status === UserStatus.WaitingForApproval;

    useEffect(() => {
        setPage(1);
    }, [search]);

    useEffect(() => {
        if (skipFirstFetch.current) {
            skipFirstFetch.current = false;
            return;
        }

        let cancelled = false;

        filterUsers({
            search: search.trim() || undefined,
            status: activeTab === "all" ? undefined : Number(activeTab),
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
    }, [search, activeTab, page, pageSize, reloadAt]);


    function openEditForm(user: User) {
        setSelectedUser(user);
        setPayload(null);
        setConfirmAction(null);
        setIsConfirmOpen(false);
        setIsFormOpen(true);
    }

    function resetForm() {
        setPayload(null);
        setConfirmAction(null);
        setIsConfirmOpen(false);
        setIsFormOpen(false);
        setSelectedUser(null);
    }

    function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (selectedUser?.status !== UserStatus.Active) return;
        setPayload(readUpdateForm(new FormData(event.currentTarget)));
        setConfirmAction("update");
        setIsConfirmOpen(true);
    }

    function openReviewConfirm(action: "approve" | "reject") {
        if (!selectedUser?.id) return;
        setConfirmAction(action);
        setIsConfirmOpen(true);
    }

    async function handleConfirm(formData: FormData) {
        const userId = Number(selectedUser?.id);
        if (!selectedUser || !userId || !confirmAction) return;

        const reason = String(formData.get("reason") ?? "").trim();
        const result =
            confirmAction === "update"
                ? selectedUser.status === UserStatus.Active && payload
                    ? await updateUser({ id: userId, ...payload })
                    : null
                : confirmAction === "approve"
                    ? await approveUser({ id: userId })
                    : await rejectUser({ id: userId, reason });

        if (!result?.ok) {
            setIsConfirmOpen(false);
            putFlash("error", result?.message ?? "Không thể cập nhật nhân viên", 1500);
            return;
        }

        resetForm();
        setReloadAt((value) => value + 1);
        putFlash("success", CONFIRM_SUCCESS[confirmAction], 1500);
    }

    return (
        <>
        <section className="section" id="admin-users-section">
            <div className="section-table mb-6">
            {/* Tab */}
                <Tab
                    tabs={USER_STATUS_TABS}
                    activeTab={activeTab}
                    onTabClick={(tab) => {
                        setActiveTab(tab.value);
                        setPage(1);
                    }}
                />

                {users === null ? (
                    <TableLoading />
                ) : users.length === 0 ? (
                    <EmptyData
                        title="Không có nhân viên"
                        description="Thử đổi bộ lọc hoặc từ khóa tìm kiếm."
                    />
                ) : (
                <div className="overview-table-wrap">
                    <div className="overview-table-inner">  
                        <table className="overview-table min-w-[1400px]" id="users-table">
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
                                {users.map((user) => (
                                    <tr key={user.id} id={`user-row-${user.id}`} onClick={() => openEditForm(user)} className="cursor-pointer">
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
                                            <UserStatusBadge status={user.status} />
                                        </td>
                                        <td className="overview-table__muted">{user.username}</td>
                                        <td className="overview-table__muted">{user.phone}</td>
                                        <td className="overview-table__muted">{user.department?.name ?? "—"}</td>
                                        <td className="overview-table__muted">{formatDateVi(user.created_at)}</td>
                                        <td className="overview-table__muted">{formatDateVi(user.activated_at)}</td>
                                        <td className="actions">
                                            <div className="admin-actions">
                                                <button
                                                type="button"
                                                className="admin-actions__btn"
                                                aria-label="Chỉnh sửa"
                                                >
                                                <Icon name="hero-pencil-square" className="size-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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

            <Modal
                id="update-user-modal"
                show={isFormOpen && selectedUser !== null}
                title="Chi tiết nhân viên"
                closeable={!isConfirmOpen}
                width="2xl"
                onClose={resetForm}
            >
                {selectedUser && (
                <form
                    key={selectedUser.id}
                    id="update-user-form"
                    className="core_modal__form overflow-hidden"
                    autoComplete="off"
                    onSubmit={handleFormSubmit}
                >
                    <div className="admin-user-form gap-4 overflow-y-auto flex-auto h-full">
                        <Input
                            id="update-user-username"
                            name="username"
                            label={<RequiredLabel>Tên đăng nhập</RequiredLabel>}
                            defaultValue={selectedUser.username}
                            readOnly
                        />
                        <Input
                            id="update-user-full-name"
                            name="full_name"
                            label={<RequiredLabel>Họ và tên</RequiredLabel>}
                            defaultValue={selectedUser.full_name}
                            readOnly={!canEdit}
                        />
                        <Input
                            id="update-user-phone"
                            name="phone"
                            label={<RequiredLabel>Số điện thoại</RequiredLabel>}
                            defaultValue={selectedUser.phone}
                            readOnly={!canEdit}
                        />
                        <Input
                            id="update-user-email"
                            name="email"
                            type="email"
                            label={<RequiredLabel>Email</RequiredLabel>}
                            placeholder="Email"
                            defaultValue={selectedUser.email ?? ""}
                            readOnly={!canEdit}
                        />
                        <SelectField
                            id="update-user-department"
                            name="department_id"
                            label={<RequiredLabel>Phòng ban</RequiredLabel>}
                            defaultValue={departmentOptionValue(selectedUser.department)}
                            disabled={!canEdit}
                        >
                            <option value="" disabled>
                            Chọn phòng ban
                            </option>
                            {departments.map((department) => (
                            <option key={department.id} value={department.id}>
                                {department.name}
                            </option>
                            ))}
                        </SelectField>
                        <Input
                            id="update-user-address"
                            name="address"
                            label={<RequiredLabel>Địa chỉ</RequiredLabel>}
                            placeholder="Địa chỉ"
                            defaultValue={selectedUser.address ?? ""}
                            readOnly={!canEdit}
                        />
                        {selectedUser.status === UserStatus.Rejected && (
                            <div className="admin-user-form__full">
                                <div className="core_field">
                                    <label htmlFor="update-user-reason" className="core_label">
                                        Lý do từ chối
                                    </label>
                                    <textarea
                                        id="update-user-reason"
                                        name="reason"
                                        rows={3}
                                        readOnly
                                        defaultValue={selectedUser.reason ?? ""}
                                        placeholder="—"
                                        className="core_input core_input--textarea w-full"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="core_modal__actions">
                    <button type="button" className="core_button core_button--secondary" onClick={resetForm}>
                        Hủy
                    </button>
                    {isPendingApproval && (
                        <>
                        <button type="button" className="core_button core_button--danger" onClick={() => openReviewConfirm("reject")}>
                            Từ chối
                        </button>
                        <button type="button" className="core_button core_button--primary" onClick={() => openReviewConfirm("approve")}>
                            Duyệt
                        </button>
                        </>
                    )}
                    {canEdit && (
                        <button type="submit" className="core_button core_button--primary">
                            Xác nhận
                        </button>
                    )}
                    </div>
                </form>
                )}
            </Modal>

            <Modal
                id="update-user-confirm-modal"
                show={isConfirmOpen}
                title={confirmAction ? CONFIRM_TITLE[confirmAction] : "Xác nhận"}
                width="md"
                className="core_modal--stacked"
                onClose={() => {
                    setIsConfirmOpen(false);
                    setConfirmAction(null);
                }}
            >
                <form className="core_modal__form" action={handleConfirm}>
                    <input type="hidden" name="user_id" value={selectedUser?.id ?? ""} />
                    <input type="hidden" name="action" value={confirmAction ?? ""} />
                    {confirmAction === "reject" && (
                        <div className="core_field">
                            <label htmlFor="reject-user-reason" className="core_label">
                                <RequiredLabel>Lý do từ chối</RequiredLabel>
                            </label>
                            <textarea
                                id="reject-user-reason"
                                name="reason"
                                rows={3}
                                required
                                placeholder="Nhập lý do từ chối"
                                className="core_input core_input--textarea w-full"
                            />
                        </div>
                    )}
                    <div className="core_modal__actions">
                    <button
                        type="button"
                        className="core_button core_button--secondary"
                        onClick={() => {
                            setIsConfirmOpen(false);
                            setConfirmAction(null);
                        }}
                    >
                        Hủy
                    </button>
                    <FormSubmitButton>
                        {confirmAction === "reject" ? "Từ chối" : confirmAction === "approve" ? "Duyệt" : "Xác nhận"}
                    </FormSubmitButton>
                    </div>
                </form>
            </Modal>
        </>
    );
}

function departmentOptionValue(department: User["department"]) {
    return department?.id != null ? String(department.id) : "";
}

function UserStatusBadge({ status }: { status?: number }) {
    const meta = userStatusMeta(status);

    return (
        <span className={`status status--${meta.kind}`}>
        {meta.label}
        </span>
    );
}
