import type { OrderStatusId } from "@/lib/constants";

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
export type OrderItem = {
  id: number;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  status: OrderStatusId;
};

export type Order = {
  id: number;
  code: string;
  agency_name: string;
  address: string;
  status: OrderStatusId;
  created_at: string;
  updated_at: string;
  /** Đã thu */
  collected_amount: number;
  /** Đã nhận */
  received_amount: number;
  items: OrderItem[];
};

export function orderTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
}