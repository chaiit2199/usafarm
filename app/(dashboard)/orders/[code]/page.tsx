import type { Metadata } from "next";

import { Dashboard } from "@/components/dashboard";
import { pageMetadata } from "@/lib/dashboard/navbar";
import type { Order } from "@/lib/api/types";
import { OrderDetailsComponent } from "@/components/order-details/order_details_component";

export const ORDERS: Order[] = [
  {
    id: 4,
    code: "DH-240515",
    agency_name: "Đại lý Cần Thơ",
    address: "88 Nguyễn Trãi, Ninh Kiều, Cần Thơ",
    status: 1,
    created_at: "2024-05-15T07:45:00+07:00",
    updated_at: "2024-05-15T07:45:00+07:00",
    total_amount: 15_850_000,
    collected_amount: 0,
    received_amount: 0,
    items: [
      {
        id: 41,
        product_code: "NPK202015-B0001-DM-M-001-50",
        product_name: "NPK 20-20-15 Hạt Hạt ép Bao Bao Kangaroo Úc màu Đỏ 50kg",
        quantity: 15,
        price: 5_000_000,
        status: "-500",
      },
      {
        id: 4,
        product_code: "NPK202015-B0001-DM-M-001-25",
        product_name: "NPK 20-20-15 Hạt Hạt ép Bao Bao Kangaroo Úc màu Đỏ 25kg",
        quantity: 15,
        price: 10_000_000,
        status: "Đủ",
      },   
    ],
  },
  {
    id: 1,
    code: "DH-240518",
    agency_name: "Đại lý Hà Nội",
    address: "12 Láng Hạ, Đống Đa, Hà Nội",
    status: 8,
    created_at: "2024-05-18T10:20:00+07:00",
    updated_at: "2024-05-20T14:05:00+07:00",
    total_amount: 9_250_000,
    collected_amount: 250_000,
    received_amount: 9_000_000,
    items: [
      {
        id: 11,
        product_code: "NPK-301010MSOP",
        product_name: "NPK 30-10-10 Bao 25kg",
        quantity: 10,
        price: 5_000_000,
        status: "-500",
      },
      {
        id: 12,
        product_code: "DAP1846MSOP",
        product_name: "DAP 18-46 Bao 50kg",
        quantity: 5,
        price: 4_250_000,
        status: "Đủ",
      },
    ],
  },
  {
    id: 2,
    code: "DH-240517",
    agency_name: "Đại lý Đà Nẵng",
    address: "45 Nguyễn Văn Linh, Hải Châu, Đà Nẵng",
    status: 2,
    created_at: "2024-05-17T10:15:00+07:00",
    updated_at: "2024-05-17T16:40:00+07:00",
    total_amount: 8_400_000,
    collected_amount: 0,
    received_amount: 0,
    items: [
      {
        id: 21,
        product_code: "URE1846MSOP",
        product_name: "Urê 46% Bao 50kg",
        quantity: 20,
        price: 8_400_000,
        status: "Đủ",
      },
    ],
  },
  {
    id: 3,
    code: "DH-240516",
    agency_name: "Đại lý HCM",
    address: "161 Võ Văn Tần, Quận 3, TP.HCM",
    status: 4,
    created_at: "2024-05-16T09:00:00+07:00",
    updated_at: "2024-05-18T11:20:00+07:00",
    total_amount: 26_700_000,
    collected_amount: 3_000_000,
    received_amount: 5_000_000,
    items: [
      {
        id: 31,
        product_code: "HUMIC-01",
        product_name: "Humic Acid Gói 1kg",
        quantity: 100,
        price: 7_500_000,
        status: "Đủ",
      },
      {
        id: 32,
        product_code: "NPK201515MSOP",
        product_name: "NPK 20-15-15 Bao 25kg",
        quantity: 40,
        price: 19_200_000,
        status: "Đủ",
      },
    ],
  }, 
  {
    id: 5,
    code: "DH-240514",
    agency_name: "Đại lý Hải Phòng",
    address: "22 Lạch Tray, Ngô Quyền, Hải Phòng",
    status: 5,
    created_at: "2024-05-14T11:20:00+07:00",
    updated_at: "2024-05-16T09:10:00+07:00",
    total_amount: 13_650_000,
    collected_amount: 0,
    received_amount: 13_650_000,
    items: [
      {
        id: 51,
        product_code: "NPK16168MSOP",
        product_name: "NPK 16-16-8 Bao 25kg",
        quantity: 30,
        price: 13_650_000,
        status: "Hoàn thành",
      },
    ],
  },
  {
    id: 6,
    code: "DH-240513",
    agency_name: "Đại lý Bình Dương",
    address: "15 Đại lộ Bình Dương, Thủ Dầu Một",
    status: 3,
    created_at: "2024-05-13T14:00:00+07:00",
    updated_at: "2024-05-14T08:30:00+07:00",
    total_amount: 7_750_000,
    collected_amount: 0,
    received_amount: 2_000_000,
    items: [
      {
        id: 61,
        product_code: "SA211846MSOP",
        product_name: "Phân SA 21% Bao 50kg",
        quantity: 25,
        price: 7_750_000,
        status: "Đủ",
      },
    ],
  },
];


type PageProps = {
  params: Promise<{ code: string }>;
};

export const metadata: Metadata = pageMetadata("/orders");

export default async function Page({ params }: PageProps) {
  const { code } = await params;

  const order = ORDERS.filter(item => item.code === code);

  return (
    <Dashboard id="order-detail-main">
      {order  && <OrderDetailsComponent  order={order[0]}/>}
    </Dashboard>
  );
}
