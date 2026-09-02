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
    icon: "hero-cube",
    children: [
      {
        id: "cost-management",
        label: "Quản lý giá vốn",
        href: "/products/cost-management",
        icon: "hero-currency-dollar",
        title: "Quản lý giá vốn",
      },
      {
        id: "ingredients",
        label: "Quản lý thành phần",
        href: "/products/ingredients",
        icon: "hero-beaker",
        title: "Quản lý thành phần",
      },
      {
        id: "packaging",
        label: "Quản lý bao bì",
        href: "/products/packaging",
        icon: "hero-archive-box",
        title: "Quản lý bao bì",
      },
      {
        id: "product",
        label: "Quản lý thành phẩm",
        href: "/products/product",
        icon: "hero-calculator",
        title: "Quản lý thành phẩm",
        create: true,
        view: true,
      },
    ],
  },
  {
    id: "order",
    resource: "order",
    label: "Quản lý đơn hàng",
    href: "/order",
    icon: "hero-clipboard-document-list",
    title: "Quản lý đơn hàng",
    create: true,
    view: true,
  },
  {
    id: "agents",
    resource: "agency",
    label: "Quản lý đại lý",
    href: "/agents",
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

export type HeaderConfig = { title: string } & Required<HeaderButtons>;

export function getHeaderConfig(pathname: string): HeaderConfig {
  const item = findMenuItem(pathname);
  return {
    title: getPageTitle(pathname),
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
