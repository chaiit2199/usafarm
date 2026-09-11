 
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

/** API order.status 0–10. */
export const ORDER_STATUSES = [
  { id: 0, semantic: "DRAFT", label: "Đơn mới", color: "#16A34A" },
  { id: 1, semantic: "WAITING_FOR_APPROVAL", label: "Chờ duyệt", color: "#D97706" },
  { id: 2, semantic: "APPROVED_WAITING_ALLOCATION", label: "Chờ phân kho", color: "#EA580C" },
  { id: 11, semantic: "APPROVED_WAITING_SHIPMENT", label: "Chờ giao hàng", color: "#0284C7" },
  { id: 12, semantic: "APPROVED_WAITING_GOODS_ISSUE", label: "Chờ xuất kho", color: "#0D9488" },
  { id: 13, semantic: "APPROVED_WAITING_HANDOVER", label: "Bàn giao thành công", color: "#2563EB" },
  { id: 3, semantic: "REJECTED", label: "Từ chối", color: "#B91C1C" },
  { id: 4, semantic: "WAITING_WAREHOUSE_ACCEPTANCE", label: "Chờ đóng gói", color: "#CA8A04" },
  { id: 5, semantic: "PROCESSING", label: "Đang đóng gói", color: "#7C3AED" },
  { id: 6, semantic: "CANCELLING", label: "Đang xử lý hủy", color: "#F97316" },
  { id: 7, semantic: "COMPLETED", label: "Hoàn thành", color: "#16A34A" },
  { id: 8, semantic: "COMPLETED_PARTIAL_CANCEL", label: "Hoàn thành, có hủy một phần", color: "#65A30D" },
  { id: 9, semantic: "CANCELLED", label: "Đã hủy", color: "#DC2626" },
  { id: 10, semantic: "SPLIT_ORDER", label: "Tách đơn", color: "#78716C" },
] as const;

export type OrderStatusId = (typeof ORDER_STATUSES)[number]["id"];
export type OrderStatusSemantic = (typeof ORDER_STATUSES)[number]["semantic"];

/** Dùng thay magic number khi so sánh status (vd. `status === orderStatus.draft`). */
export const orderStatus = {
  draft: 0,
  waitingForApproval: 1,
  approvedWaitingAllocation: 2,
  rejected: 3,
  waitingWarehouseAcceptance: 4,
  processing: 5,
  cancelling: 6,
  completed: 7,
  completedPartialCancel: 8,
  cancelled: 9,
  splitOrder: 10,
  approvedWaitingShipment: 11,
  approvedWaitingGoodsIssue: 12,
} as const satisfies Record<string, OrderStatusId>;

export type OrderStatusInput = number | { code: number; semantic?: string; label?: string };

function resolveOrderStatus(status: OrderStatusInput) {
  const raw = typeof status === "number" ? status : status.code;
  const code = Number(raw);
  const semantic = typeof status === "number" ? undefined : status.semantic;
  return (
    (Number.isFinite(code) ? ORDER_STATUSES.find((s) => s.id === code) : undefined) ??
    ORDER_STATUSES.find((s) => s.semantic === semantic) ??
    null
  );
}

export function getOrderStatusLabel(status: OrderStatusInput) {
  const matched = resolveOrderStatus(status);
  if (matched) return matched.label;
  if (typeof status === "object") return status.label ?? status.semantic ?? "Không xác định";
  return "Không xác định";
}

export function orderColor(status: OrderStatusInput) {
  return resolveOrderStatus(status)?.color ?? "#94A3B8";
}

export function getOrderStatusMeta(status: OrderStatusInput) {
  return resolveOrderStatus(status);
}  
/** Fake series for overview pie chart — status key = id string. */
export const ORDER_SERIES = ORDER_STATUSES.map((status, index) => ({
  status: String(status.id),
  value: [18, 42, 28, 12, 22, 35, 8, 61, 14, 19][index] ?? 10,
})).map((item) => ({
  ...item,
  label: getOrderStatusLabel(Number(item.status)),
  color: orderColor(Number(item.status)),
}));
