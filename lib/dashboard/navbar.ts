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
    id: "warehouse",
    label: "Quản lý kho",
    title: "Quản lý kho",
    icon: "hero-building-storefront",
    children: [
      {
        id: "warehouses",
        label: "Nền tảng gốc — cấu hình kho bãi để gán số dư độc lập cho các phân hệ sau",
        href: "/warehouse",
        icon: "hero-building-office-2",
        title: "Quản lý kho hàng",
      },
      {
        id: "packaging-stock",
        label: "Theo dõi tồn kho theo vị trí bãi chứa và quyền sở hữu bao bì",
        href: "/warehouse/packaging",
        icon: "hero-archive-box",
        title: "Quản lý vỏ bao",
      },
      {
        id: "raw-materials",
        label: "Theo dõi khối lượng nguyên liệu thô theo từng kho bồn chứa",
        href: "/warehouse/ingredients",
        icon: "hero-beaker",
        title: "Quản lý nguyên liệu",
      },
      {
        id: "finished-goods",
        label: "Thành phẩm từ hàng hoàn về, có thể xuất ngay không cần chạy máy đóng gói lại",
        href: "/warehouse/finished-goods",
        icon: "hero-cube",
        title: "Tồn kho thành phẩm",
      },
    ],
  },
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
    view: true,
    filter: true,
    search: true,
    export: true,
  },
  {
    id: "production",
    label: "Quản lý sản xuất",
    title: "Quản lý sản xuất",
    icon: "hero-circle-stack",
    children: [
      {
        id: "packaging-tracking",
        label: "Dành riêng cho xưởng đóng bao — xem trọn vẹn đơn hàng, đóng gói & kiểm đếm từng sản phẩm",
        href: "/production/packaging",
        icon: "hero-shopping-bag",
        title: "Theo dõi đóng gói",
      },
      {
        id: "stock-export",
        label: "Đơn đã đóng gói xong 100% sản phẩm, chờ lập phiếu xuất kho Mẫu 02-VT",
        href: "/production/export",
        icon: "hero-document-plus",
        title: "Lập phiếu xuất kho",
      },
      {
        id: "handover-pod",
        label: "Đơn đã xuất kho, chờ xác nhận bàn giao và upload chứng từ ký nhận",
        href: "/production/handover",
        icon: "hero-truck",
        title: "Bàn giao ĐVVC / POD",
      },
    ],
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

/** Parent menu for nested paths (`/orders/12` → `/orders`). */
function findPrefixMenuItem(pathname: string, menu: Navbar[] = MENU): Navbar | NavBarItem | null {
  let best: Navbar | NavBarItem | null = null;
  for (const item of menu) {
    for (const entry of [item, ...(item.children ?? [])]) {
      const href = entry.href;
      if (!href || href === "/") continue;
      if (pathname.startsWith(`${href}/`) && (!best || href.length > (best.href?.length ?? 0))) {
        best = entry;
      }
    }
  }
  return best;
}

export const DEFAULT_PAGE_TITLE = "USA FARM AGRI";

export type HeaderPageOptions = {
  subpage?: string;
  href?: string;
  /** Override header action buttons (e.g. show export on detail pages). */
  export?: boolean;
  create?: boolean;
  filter?: boolean;
  search?: boolean;
  authorization?: boolean;
};

export type HeaderConfig = {
  title: string;
  label: string;
  href?: string;
  subpage?: string;
} & Required<HeaderButtons>;

export function getPageTitle(pathname: string): string {
  return (
    findMenuItem(pathname)?.title ??
    findPrefixMenuItem(pathname)?.title ??
    DEFAULT_PAGE_TITLE
  );
}

export function getHeaderConfig(
  pathname: string,
  options?: HeaderPageOptions,
): HeaderConfig {
  const exact = findMenuItem(pathname);
  const item = exact ?? findPrefixMenuItem(pathname);
  const title = item?.title ?? DEFAULT_PAGE_TITLE;
  const subpage = options?.subpage;
  const isNested = !exact && Boolean(item);
  const href = options?.href ?? (subpage ? item?.href : undefined);
  const hideActions = Boolean(subpage) || isNested;

  function action(
    key: keyof HeaderButtons,
    fromMenu: boolean | undefined,
  ): boolean {
    const override = options?.[key];
    if (override != null) return override;
    return hideActions ? false : Boolean(fromMenu);
  }

  return {
    title,
    label: subpage ? "" : (item?.label ?? title),
    href,
    subpage,
    create: action("create", item?.create),
    export: action("export", item?.export),
    filter: action("filter", item?.filter),
    authorization: action("authorization", item?.authorization),
    search: action("search", item?.search),
  };
}

export function getPageId(pathname: string) {
  return findMenuItem(pathname)?.id ?? findPrefixMenuItem(pathname)?.id ?? "";
}

export function pageMetadata(pathname: string, subpage?: string): Metadata {
  return { title: subpage ?? getPageTitle(pathname) };
}
