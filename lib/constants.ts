export const ORDER_STATUSES = [
  { label: "Chờ giao", value: "pending", color: "#E8A45A" },
  { label: "Đang xử lý", value: "processing", color: "#F97316" },
  { label: "Đang giao", value: "shipping", color: "#7C3AED" },
  { label: "Sắp đến hạn", value: "due_soon", color: "#C4A35A" },
  { label: "Quá hạn", value: "overdue", color: "#D4727D" },
  { label: "Hủy", value: "cancelled", color: "#DC2626" },
  { label: "Hoàn thành", value: "completed", color: "#3B7A57" },
] as const;

export function orderLabel(status: string) {
  return ORDER_STATUSES.find((item) => item.value === status)?.label ?? "Không xác định";
}

export function orderColor(status: string) {
  return ORDER_STATUSES.find((item) => item.value === status)?.color ?? "#94A3B8";
}

export const ORDER_SERIES = [
  { status: "completed", value: 180 },
  { status: "processing", value: 93 },
  { status: "shipping", value: 65 },
  { status: "cancelled", value: 3 },
].map((item) => ({
  ...item,
  label: orderLabel(item.status),
  color: orderColor(item.status),
}));

/** API: 0 = inactive, 1 = active, 2 = waiting for approve, 3 = rejected. */
export enum UserStatus {
  Active = 1,
  Inactive = 0,
  WaitingForApproval = 2,
  Rejected = 3,
}

export type RecordStatus = UserStatus.Active | UserStatus.Inactive | UserStatus.WaitingForApproval | UserStatus.Rejected;

const RECORD_STATUS_META = {
  [UserStatus.Active]: { kind: "active", label: "Đang hoạt động" },
  [UserStatus.Inactive]: { kind: "paused", label: "Ngưng hoạt động" },
  [UserStatus.WaitingForApproval]: { kind: "waiting-for-approval", label: "Chờ phê duyệt" },
  [UserStatus.Rejected]: { kind: "rejected", label: "Từ chối" },
} as const;

const UNKNOWN_STATUS = { kind: "new", label: "—" } as const;

export const RECORD_STATUS_OPTIONS = [
  { value: UserStatus.Active, label: RECORD_STATUS_META[UserStatus.Active].label },
  { value: UserStatus.Inactive, label: RECORD_STATUS_META[UserStatus.Inactive].label },
  { value: UserStatus.WaitingForApproval, label: RECORD_STATUS_META[UserStatus.WaitingForApproval].label },
  { value: UserStatus.Rejected, label: RECORD_STATUS_META[UserStatus.Rejected].label },
] as const;

/** Tabs filter danh sách user: Tất cả + các status trong RECORD_STATUS_OPTIONS. */
export const USER_STATUS_TABS = [
  { value: "all" as const, label: "Tất cả" },
  ...RECORD_STATUS_OPTIONS,
];

export type UserStatusTabValue = (typeof USER_STATUS_TABS)[number]["value"];

export function isRecordStatus(value: number): value is RecordStatus {
  return value in RECORD_STATUS_META;
}

export function readFormStatus(data: FormData, field = "status"): RecordStatus | undefined {
  const value = Number(data.get(field));
  return isRecordStatus(value) ? value : undefined;
}

export function recordStatusMeta(status?: number) {
  if (status != null && status in RECORD_STATUS_META) {
    return RECORD_STATUS_META[status as RecordStatus];
  }

  return UNKNOWN_STATUS;
}

/** @deprecated Dùng recordStatusMeta — giữ alias cho component user. */
export const userStatusMeta = recordStatusMeta;

/** Role dùng cùng 0/1/2/3 với user & department. */
export const roleStatusMeta = recordStatusMeta;
