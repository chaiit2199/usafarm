import type { Metadata } from "next";

import type { MeAccessActions, MeAccessPermission } from "@/lib/api/types";

export type HeaderButtons = {
  create?: boolean;
  export?: boolean;
  filter?: boolean;
  authorization?: boolean;
  search?: boolean;
};

export type NavBarItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
  title?: string;
  resource?: string;
  view?: boolean;
  actions?: MeAccessActions;
} & HeaderButtons;

export type Navbar = {
  id: string;
  label: string;
  href?: string;
  icon: string;
  title?: string;
  children?: NavBarItem[];
  resource?: string;
  view?: boolean;
  actions?: MeAccessActions;
} & HeaderButtons;

export const MENU: Navbar[] = [
  { id: "home", label: "Dashboard", href: "/", icon: "hero-squares-2x2", title: "Tổng quan" },
  {
    id: "products",
    label: "Sản phẩm",
    title: "Sản phẩm",
    icon: "hero-cube",
    children: [
      {
        id: "cost-management",
        label: "Thêm nguyên liệu vào kho",
        href: "/products/cost-management",
        icon: "hero-puzzle-piece",
        title: "Quản lý nguyên liệu",
      },
      {
        id: "quantification",
        label: "Định lượng nguyên liệu",
        href: "/products/quantification",
        icon: "hero-scale",
        title: "Quản lý định lượng",
      },
      {
        id: "ingredients",
        label: "Tạo mới nhóm hàng (NPK, DAP, HUMIC...)",
        href: "/products/ingredients",
        icon: "hero-folder",
        title: "Quản lý nhóm hàng",
      },
      {
        id: "types",
        label: "Tạo mới loại hàng (30-10-10, 20-15-15...)",
        href: "/products/types",
        icon: "hero-variable",
        title: "Quản lý loại hàng",
      },
      {
        id: "seeds",
        label: "Tạo mới loại hạt",
        href: "/products/seeds",
        icon: "hero-swatch",
        title: "Quản lý loại hạt",
      },
      {
        id: "packaging",
        label: "Thêm mới mẫu bao bì và gán vào nhóm hàng",
        href: "/products/packaging",
        icon: "hero-archive-box",
        title: "Quản lý bao bì",
        create: true,
        search: true,
      },
      {
        id: "product",
        label:
          "Hệ thống tự động tạo sản phẩm từ nhóm hàng, loại hàng, bao bì, loại hạt",
        href: "/products/product",
        icon: "hero-cube",
        title: "Quản lý sản phẩm",
        create: true,
        view: true,
      },
    ]
  },
  {
    id: "order",
    resource: "order",
    label: "Quản lý đơn hàng",
    href: "/orders",
    icon: "hero-clipboard-document-list",
    title: "Quản lý đơn hàng",
    create: true,
    view: true,
    filter: true,
    search: true,
  },
  {
    id: "agents",
    resource: "agency",
    label: "Quản lý đại lý",
    href: "/agencies",
    icon: "hero-users",
    title: "Quản lý đại lý",
    create: true,
    view: true,
  },
  {
    id: "promotion",
    resource: "promotion",
    label: "Khuyến mãi",
    href: "/promotion",
    icon: "hero-ticket",
    title: "Khuyến mãi",
    create: true,
    view: true,
  },
  {
    id: "management",
    label: "Quản lý",
    title: "Quản lý",
    icon: "hero-building-office-2",
    children: [
      {
        id: "user",
        resource: "user",
        label: "Nhân viên",
        href: "/users",
        icon: "hero-identification",
        title: "Nhân viên",
        create: true,
        search: true,
        view: true,
      },
      {
        id: "departments",
        label: "Phòng ban",
        href: "/departments",
        icon: "hero-user-group",
        title: "Phòng ban",
        create: true,
        search: true,
        view: true,
      },
      {
        id: "role",
        label: "Nhóm quyền",
        href: "/roles",
        icon: "hero-shield-check",
        title: "Nhóm quyền",
        create: true,
        search: true,
        view: true,
      },
      {
        id: "authorization",
        label: "Phân quyền",
        href: "/authorization",
        icon: "hero-cog-6-tooth",
        title: "Phân quyền",
        authorization: true,
        search: true,
        view: true,
      },
    ],
  },
];

function isVisible(
  item: { resource?: string },
  byResource: Map<string, MeAccessActions>,
) {
  const resource = item.resource?.trim();
  if (!resource) return true;
  return byResource.has(resource);
}

function attachActions<T extends { resource?: string; create?: boolean; view?: boolean }>(
  item: T,
  byResource: Map<string, MeAccessActions>,
): T {
  const resource = item.resource?.trim();
  if (!resource) return item;

  const actions = byResource.get(resource);
  if (!actions) return item;

  return {
    ...item,
    actions,
    create: actions.create,
    view: actions.read,
  };
}

/** Ẩn item có `resource` không có trong permissions; gắn `actions` khi khớp. */
export function buildMenuWithPermissions(
  permissions: MeAccessPermission[],
  menu: Navbar[] = MENU,
): Navbar[] {
  const byResource = new Map(permissions.map((entry) => [entry.resource, entry.actions]));

  return menu.flatMap((item) => {
    if (item.children) {
      const children = item.children
        .filter((child) => isVisible(child, byResource))
        .map((child) => attachActions(child, byResource));

      if (children.length === 0) return [];
      return [{ ...item, children }];
    }

    if (!isVisible(item, byResource)) return [];
    return [attachActions(item, byResource)];
  });
}


function findMenuItem(pathname: string, menu: Navbar[] = MENU) {
  for (const item of menu) {
    if (item.href === pathname) return item;
    const child = item.children?.find((entry) => entry.href === pathname);
    if (child) return child;
  }
  return null;
}

export const DEFAULT_PAGE_TITLE = "USA FARM AGRI";

export function getPageTitle(pathname: string): string {
  return findMenuItem(pathname)?.title ?? DEFAULT_PAGE_TITLE;
}

export type HeaderConfig = { title: string, label: string } & Required<HeaderButtons>;

export function getHeaderConfig(pathname: string): HeaderConfig {
  const item = findMenuItem(pathname);
  const title = getPageTitle(pathname);
  return {
    title: title,
    label: item?.label ?? title,
    create: Boolean(item?.create),
    export: Boolean(item?.export),
    filter: Boolean(item?.filter),
    authorization: Boolean(item?.authorization),
    search: Boolean(item?.search),
  };
}

export function getPageId(pathname: string) {
  return findMenuItem(pathname)?.id ?? "";
}

export function pageMetadata(pathname: string): Metadata {
  return { title: getPageTitle(pathname) };
}
