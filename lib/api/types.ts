export type ApiListMeta = {
  total?: number;
  page?: number;
  page_size?: number;
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