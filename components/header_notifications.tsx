"use client";

import { useState } from "react";

import { Dropdown } from "@/components/core_component";
import { Icon } from "@/components/icon";

type Notification = {
  id: number;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
};

const FAKE_NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: "Đơn hàng mới",
    message: "DH-240518 vừa được tạo từ Đại lý Hà Nội",
    created_at: "10 phút trước",
    read: false,
  },
  {
    id: 2,
    title: "Nhân viên chờ duyệt",
    message: "Có 3 nhân viên đang chờ phê duyệt",
    created_at: "1 giờ trước",
    read: false,
  },
  {
    id: 3,
    title: "Xuất báo cáo xong",
    message: "File báo cáo tháng 5 đã sẵn sàng tải về",
    created_at: "Hôm qua",
    read: true,
  },
];

export function HeaderNotifications() {
  const [items, setItems] = useState(FAKE_NOTIFICATIONS);
  const unreadCount = items.filter((item) => !item.read).length;

  function markAsRead(id: number) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }

  return (
    <Dropdown
      id="header-notifications"
      placement="bottom-right"
      className="header__notifications"
      label={
        <span className="header__notify-btn" aria-label="Thông báo">
          <Icon name="hero-bell" className="size-5" />
          {unreadCount > 0 && (
            <span className="header__notify-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
          )}
        </span>
      }
    >
      <div className="header-notify" role="menu">
        <div className="header-notify__head">
          <strong>Thông báo</strong>
          {unreadCount > 0 ? <span>{unreadCount} chưa đọc</span> : <span>Đã đọc hết</span>}
        </div>

        <ul className="header-notify__list">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={["header-notify__item", !item.read && "is-unread"].filter(Boolean).join(" ")}
                onClick={() => markAsRead(item.id)}
              >
                <span className="header-notify__title">{item.title}</span>
                <span className="header-notify__message">{item.message}</span>
                <span className="header-notify__time">{item.created_at}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Dropdown>
  );
}
