"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Dropdown } from "@/components/core_component";
import { Icon } from "@/components/icon";
import { UserAvatarRow } from "@/components/user-components";
import { getPageId, type Navbar } from "@/lib/dashboard/navbar";
import type { User } from "@/lib/api/me";
import { ChangePasswordComponent } from "@/components/users/change_password";

export function SidebarComponent({ user, menu }: { user?: User | null; menu: Navbar[] }) {
  const pathname = usePathname();
  const currentPage = getPageId(pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(() => {
    const match = menu.findIndex((item) => item.children?.some((child) => child.href === pathname));
    return match >= 0 ? match : null;
  });
  const displayName = user?.full_name || user?.username || "User";
  const role = user?.role ?? "1002";
  const userId = String(user?.id ?? user?.username ?? "guest");

  useEffect(() => {
    const match = menu.findIndex((item) => item.children?.some((child) => child.href === pathname));
    if (match >= 0) setOpenIndex(match);
  }, [pathname, menu]);

  function groupOpen(index: number) {
    return openIndex === index;
  }

  function groupActive(item: Navbar) {
    return currentPage === item.id || Boolean(item.children?.some((child) => child.id === currentPage));
  }

  return (
    <aside
      id="dash-sidebar"
      className={["dash-sidebar", collapsed && "toggle", !collapsed && "is-expanded"].filter(Boolean).join(" ")}
      aria-label="Điều hướng chính"
      data-collapsed={String(collapsed)}
    >
      <div className="dash-sidebar__brand">
        <Link href="/" className="dash-sidebar__logo" aria-label="USA Farm">
          <img src="/images/logo.png" alt="Logo" className="dash-sidebar__logo-img" />
        </Link>

        <button
          type="button"
          id="sidebar-toggle"
          className={["dash-sidebar__toggle", collapsed && "is-open"].filter(Boolean).join(" ")}
          aria-label={collapsed ? "Mở rộng menu" : "Thu nhỏ menu"}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
        >
          <img src="/icons/ic-toggle.svg" alt="" className="w-8 h-8" />
        </button>
      </div>

      <ul className="dash-sidebar__nav">
        {menu.map((item, index) => {
          const isOpen = groupOpen(index);

          return (
            <li
              key={item.id}
              id={`nav-group-${item.id}`}
              className={["dash-sidebar__group", isOpen && "is-open"].filter(Boolean).join(" ")}
            >
              {item.children ? (
                <>
                  <button
                    type="button"
                    id={`nav-${item.id}`}
                    className={[
                      "dash-sidebar__item dash-sidebar__item--toggle",
                      groupActive(item) && "active",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    title={item.label}
                    aria-expanded={isOpen}
                    aria-controls={`nav-sub-${item.id}`}
                    onClick={() => {
                      setCollapsed(false);
                      setOpenIndex(openIndex === index ? null : index);
                    }}
                  >
                    <Icon name={item.icon} className="dash-sidebar__icon" />
                    <span className="dash-sidebar__label">{item.label}</span>
                    <svg
                      className="dash-sidebar__chevron"
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                    >
                      <path d="m17.414 10.586-8-8a2 2 0 0 0-2.828 2.828L13.172 12l-6.586 6.586a2 2 0 0 0 2.828 2.828l8-8a2 2 0 0 0 0-2.828" fill="#9197b3" />
                    </svg>
                  </button>
                  <ul id={`nav-sub-${item.id}`} className="dash-sidebar__subnav" hidden={!isOpen}>
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={child.href}
                          className={[
                            "dash-sidebar__subitem",
                            currentPage === child.id && "active",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          id={`nav-${child.id}`}
                          title={child.label}
                          onClick={() => collapsed && setCollapsed(false)}
                        >
                          <Icon name={child.icon} className="dash-sidebar__icon" />
                          <span className="dash-sidebar__label">{child.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Link
                  href={item.href!}
                  className={["dash-sidebar__item", currentPage === item.id && "active"]
                    .filter(Boolean)
                    .join(" ")}
                  id={`nav-${item.id}`}
                  title={item.label}
                  onClick={() => collapsed && setCollapsed(false)}
                >
                  <Icon name={item.icon} className="dash-sidebar__icon" />
                  <span className="dash-sidebar__label">{item.label}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ul>

      <div className="sidebar__footer" id="sidebar-user-footer">
        <Dropdown
          id={`header-user-actions-${userId}`}
          placement={collapsed ? "top-left" : "top-right"}
          className="header__user-menu"
          label={<UserAvatarRow fullname={displayName} email={user?.email ?? "hungnd@usa-farm.vn"} role={role} />}
        >
          <div className="header-menu" role="menu">
            <div className="header-menu__section">
              <button type="button" id="open-account-info" className="header-menu__item" role="menuitem">
                <Icon name="hero-identification" className="header-menu__icon" />
                <span>Thông tin tài khoản</span>
              </button>
              <ChangePasswordComponent />
            </div>

            <div className="header-menu__divider" role="separator" />

            <form action="/api/logout" method="post" id="header-logout-form" className="header-menu__section">
              <button
                type="submit"
                className="header-menu__item header-menu__item--danger"
                role="menuitem"
              >
                <Icon name="hero-arrow-right-start-on-rectangle" className="header-menu__icon" />
                <span>Đăng xuất</span>
              </button>
            </form>
          </div>
        </Dropdown>
      </div>
    </aside>
  );
}
