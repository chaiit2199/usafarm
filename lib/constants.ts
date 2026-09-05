 
export const PACKAGING_UNITS = [
  { label: "Cái", value: "CAI"},
  { label: "Viên", value: "VIEN"},
  { label: "Thùng", value: "THUNG"},
  { label: "Bao", value: "BAO"},
  { label: "Chai", value: "CHAI"},
  { label: "Gói", value: "GOI"},
  { label: "Tấn", value: "TAN"},
  { label: "Tạ", value: "TA"},
  { label: "Kilogram", value: "KILOGRAM"},
  { label: "Gram", value: "GRAM"},
] as const; 

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

// ORDER STATUSES
export const ORDER_STATUSES = [
  { id: 1, label: "Đơn mới", color: "#E8A45A" },
  { id: 2, label: "Chuẩn bị hàng", color: "#F97316" },           // Chuẩn bị hàng
  { id: 3, label: "Đóng gói", color: "#C4A35A" },
  { id: 4, label: "Đang vận chuyển", color: "#7C3AED" },
  { id: 5, label: "Đã vận chuyển", color: "#6366F1" },
  { id: 6, label: "Đã thu một phần", color: "#0EA5E9" },
  { id: 7, label: "Đã thu tiền", color: "#14B8A6" },
  { id: 8, label: "Hoàn thành", color: "#3B7A57" },
] as const;

export type OrderStatusId = (typeof ORDER_STATUSES)[number]["id"]; 

export function getOrderStatusLabel(statusId: number) {
  return ORDER_STATUSES.find((s) => s.id === statusId)?.label ?? "Không xác định";
}

export function orderColor(statusId: number) {
  return ORDER_STATUSES.find((s) => s.id === statusId)?.color ?? "#94A3B8";
}

/** Fake series for overview pie chart — status key = id string. */
export const ORDER_SERIES = [
  { status: "1", value: 42 },
  { status: "2", value: 28 },
  { status: "3", value: 19 },
  { status: "4", value: 35 },
  { status: "5", value: 22 },
  { status: "8", value: 61 },
].map((item) => ({
  ...item,
  label: getOrderStatusLabel(Number(item.status)),
  color: orderColor(Number(item.status)),
}));