export type ApiListMeta = {
  /** @deprecated Prefer total_records — kept for older list endpoints */
  total?: number;
  /** @deprecated Prefer current_page */
  page?: number;
  page_size?: number;
  current_page?: number;
  total_page?: number;
  total_records?: number;
  trace_id?: string;
};

export type User = {
  id?: number | string;
  code?: string;
  username: string;
  full_name: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string | number;
  status?: number;
  department?: Department | null;
  reason?: string;
  created_at?: string;
  activated_at?: string;
};

export type Department = {
  id: number;
  code: string;
  name: string;
  status?: number;
  reason?: string;
  created_at?: string;
  activated_at?: string;
};

export type RoleGrant = {
  permission_id: number;
  permission_code: string;
};

export type Role = {
  id: number;
  code: string;
  name: string;
  status: number;
  version: number;
  description: string;
  is_system: boolean;
  allowed_scope_types: string[];
  grants: RoleGrant[];
  users_count: number;
  created_at?: string;
  activated_at?: string;
  reason?: string;
};

export type ShortRole = Pick<Role, "id" | "name">;

export type CurrentUserResponse = {
  data: {
    user: User;
  };
};

export type UsersResponse = {
  data: User[];
  meta?: ApiListMeta;
};

export type DepartmentsResponse = {
  data: Department[];
  meta?: ApiListMeta;
};

export type RolesResponse = {
  data: Role[];
  meta?: ApiListMeta;
};

export type ShortRolesResponse = {
  data: ShortRole[];
  meta?: ApiListMeta;
};

export type ScopeTypesResponse = {
  data: ScopeType[];
  meta?: ApiListMeta;
};

export type Permission = {
  id: number;
  code: string;
  module_code: string;
  module_name: string;
  function_name: string;
  allowed_scope_types: string[];
};

export type CatalogPermissionsResponse = {
  data: Permission[];
  meta?: ApiListMeta;
};

export type RolePermissionsResponse = {
  data: {
    permissions: Permission[];
    role: {
      code: string;
      id: number;
      name: string;
      status: number;
      version: number;
      is_system: boolean;
      allowed_scope_types: string[];
    };
  };
  meta?: ApiListMeta;
};

export type ScopeType = {
  code: string;
  name: string;
  description: string;
  requires_targets: boolean;
  target_resource: string | null;
};

export type ScopeTarget = {
  id: number;
  code: string;
  name: string;
  status?: number;
  address?: string;
  latitude?: string;
  longitude?: string;
  cover_priority?: number;
  region_code?: string;
};

export type ScopeTargetsResponse = {
  data: ScopeTarget[];
  meta?: ApiListMeta;
};

export type UserAccessTarget = {
  id: number;
  code: string;
  name: string;
};

export type UserAccessRole = {
  id: number;
  code: string;
  name: string;
  scope_type: string;
  is_system: boolean;
  targets: UserAccessTarget[];
  managed_for_user: unknown | null;
};

export type UserAccessPermissionSource = {
  role_id: number;
  role_code: string;
};

export type UserAccessPermission = {
  id: number;
  code: string;
  sources: UserAccessPermissionSource[];
};

export type UserAccessResponse = {
  data: {
    user: {
      roles: UserAccessRole[];
    };
    permissions: UserAccessPermission[];
  };
};

export type MeAccessActions = {
  approve: boolean;
  create: boolean;
  delete: boolean;
  edit: boolean;
  read: boolean;
  reject: boolean;
};

export type MeAccessPermission = {
  resource: string;
  actions: MeAccessActions;
  extra_actions: string[];
  permission_codes: string[];
};

export type MeAccessData = {
  roles: UserAccessRole[];
  permissions: MeAccessPermission[];
};

export type MeAccessResponse = {
  data: MeAccessData;
};

export type PackagingGroup = {
  id: number;
  code: string;
  name: string;
  status: number;
};

export type PackagingImage = {
  id?: number;
  url: string;
  is_primary?: boolean;
  sort_order?: number;
  content_type?: string;
  image_type?: string;
  original_filename?: string;
  size_bytes?: number;
};

export type Packaging = {
  id: number;
  code: string;
  name: string;
  status: number;
  unit: string;
  weight_kg: string | number;
  note?: string;
  groups: PackagingGroup[];
  images?: PackagingImage[];
};

export type PackagingsResponse = {
  data: Packaging[];
  meta?: ApiListMeta;
};

export type PackagingResponse = {
  data: Packaging;
  meta?: ApiListMeta;
};

export type PackagingGroupsResponse = {
  data: PackagingGroup[];
  meta?: ApiListMeta;
};



// Order
export type OrderStatusRef = {
  code: number;
  semantic: string;
  label?: string;
};

export type OrderAgency = {
  id: number;
  code: string;
  name: string;
  phone?: string | null;
  contact_name?: string | null;
};

export type OrderCreator = {
  id: number;
  code: string;
  name: string;
};

export type OrderDeliveryAddress = {
  address: string;
  label?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  source_agency_address_id?: number | null;
};

export type OrderFinancialSummary = {
  payment_status: string;
  net_received_amount: string;
  outstanding_receivable_amount: string;
  overpaid_amount: string;
  payable_amount: string;
  receivable_amount: string;
  received_amount: string;
  refunded_amount: string;
  remaining_amount: string;
};

export type OrderLine = {
  id: number;
  packaging_id: number;
  requested_core_material_id: number;
  sales_sku_id: number;
  sales_sku_code: string;
  packaging_name: string;
  packaging_weight_kg: number;
  core_name: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  minimum_price: string;
  discount_amount: string;
  subtotal_amount: string;
  total_amount: string;
};

/** @deprecated Prefer OrderLine */
export type OrderItem = OrderLine;

export type Order = {
  id: number;
  code: string;
  version: number;
  status: OrderStatusRef;
  agency_id: number;
  agency: OrderAgency;
  created_by: OrderCreator;
  created_at: string;
  updated_at: string;
  locked_at?: string | null;
  delivery_address: OrderDeliveryAddress;
  discount_amount: string;
  discount_percent: string;
  subtotal_amount: string;
  shipping_amount: string;
  total_amount: string;
  financial_revision: number;
  financial_status: OrderStatusRef;
  financial_summary: OrderFinancialSummary;
  warehouse_assignments: unknown[];
  lines: OrderLine[];
  children: Order[];
}; 

export type OrdersResponse = {
  data: Order[];
  meta?: ApiListMeta;
};

export type OrderResponse = {
  data: Order;
  meta?: ApiListMeta;
};

export type OrderSummary = {
  currency: string;
  total_orders: number;
  revenue_amount: number;
  collected_amount: number;
  debt_amount: number;
};

export type OrderSummaryResponse = {
  data: OrderSummary;
  meta?: ApiListMeta;
};

export type OrderFulfillmentAllocationProposal = {
  suggested_finished_goods_quantity: number; // Gợi ý xuất từ thành phẩm sẵn
  suggested_pack_new_quantity: number; // Gợi ý đóng mới từ vỏ + ruột
  suggested_quantity: number; // Tổng bao kho này có thể giao (thành phẩm + đóng mới)
  waiting_quantity: number; // Phần còn thiếu / treo chờ sau khi lấy hết khả năng kho này
};

export type OrderFulfillmentWarehouse = {
  warehouse_id: number; // ID kho
  warehouse_code: string; // Mã kho
  warehouse_name: string; // Tên kho hiển thị
  packaging_available: number; // Tồn vỏ bao khả dụng
  is_packaging_available: boolean; // Vỏ bao đủ cho nhu cầu dòng này
  finished_goods_available: number; // Tồn thành phẩm đóng sẵn có thể xuất thẳng
  is_finished_goods_available: boolean; // Thành phẩm sẵn đủ cho nhu cầu
  core_available: string; // Lượng ruột thô / cốt còn (string số, vd. "3000.000")
  unit: string; // Đơn vị của core_available (vd. "kilogram", "ton")
  is_core_available: boolean; // Ruột thô đủ cho nhu cầu
  can_fulfill_remaining: boolean; // Kho đủ hoàn tất phần còn lại (không cần tách đơn chờ)
  allocation_proposal: OrderFulfillmentAllocationProposal; // Đề xuất phân bổ xuất / đóng từ kho này
};

export type OrderFulfillmentLine = {
  order_line_id: number;
  requested_quantity: number;
  remaining_quantity: number;
  warehouses: OrderFulfillmentWarehouse[];
};

export type OrderFulfillmentCapacity = {
  order_id: number;
  calculated_at: string;
  proposal_only: boolean;
  lines: OrderFulfillmentLine[];
};

export type OrderFulfillmentCapacityResponse = {
  data: OrderFulfillmentCapacity;
  meta?: ApiListMeta;
};

export function orderAmount(value: string | number | null | undefined): number {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function orderTotal(order: Order): number {
  return orderAmount(order.total_amount);
}

export function orderReceived(order: Order): number {
  return orderAmount(order.financial_summary?.received_amount);
}

export function orderRemaining(order: Order): number {
  return orderAmount(order.financial_summary?.remaining_amount);
}

export type ProductComponent = {
  type: string;
  code: string;
  owner: string;
  demand: string;
  stock: string;
  status: string;
};

// Production — warehouse packing orders
export type WarehouseOrderLine = {
  id: number;
  sales_sku_id: number;
  sales_sku_code: string;
  sku_name: string;
  quantity: number;
  finished_goods_quantity: number;
  pack_new_quantity: number;
  packed_quantity: number;
  /** Present on detail endpoint */
  packaging_id?: number;
  packaging_name?: string;
  core_material_id?: number;
  core_material_name?: string;
  packaging_weight_kg?: number;
  unit?: string;
};

export type WarehouseOrder = {
  id: number;
  code: string;
  parent_order_id: number;
  parent_order_code: string;
  status: number;
  warehouse_id: number;
  warehouse_name: string;
  agency_id: number;
  agency_name: string;
  total_items: number;
  completed_items: number;
  total_quantity: number;
  finished_goods_quantity: number;
  pack_new_quantity: number;
  packed_quantity: number;
  started_at: string;
  created_at: string;
  /** Present on detail endpoint */
  completed_at?: string | null;
  updated_at?: string;
  lines: WarehouseOrderLine[];
};

export type WarehouseOrdersResponse = {
  data: WarehouseOrder[];
  meta?: ApiListMeta;
};

export type WarehouseOrderResponse = {
  data: WarehouseOrder;
  meta?: ApiListMeta;
};
