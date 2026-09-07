import type { Order } from "@/lib/api/types";

function money(value: number) {
  return value.toFixed(5);
}

function line(partial: {
  id: number;
  sales_sku_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  packaging_name?: string;
  core_name?: string;
}): Order["lines"][number] {
  const total = partial.quantity * partial.unit_price;
  return {
    id: partial.id,
    packaging_id: 1,
    requested_core_material_id: 1,
    sales_sku_id: partial.id,
    sales_sku_code: partial.sales_sku_code,
    packaging_name: partial.packaging_name ?? "Bao",
    packaging_weight_kg: "25.000",
    core_name: partial.core_name ?? "NPK",
    product_name: partial.product_name,
    quantity: partial.quantity,
    unit_price: money(partial.unit_price),
    minimum_price: money(partial.unit_price),
    discount_amount: money(0),
    subtotal_amount: money(total),
    total_amount: money(total),
  };
}

function order(partial: {
  id: number;
  code: string;
  status: number;
  semantic: string;
  agency_name: string;
  address: string;
  created_at: string;
  updated_at: string;
  total: number;
  received?: number;
  remaining?: number;
  lines: Order["lines"];
}): Order {
  const received = partial.received ?? 0;
  const remaining = partial.remaining ?? Math.max(partial.total - received, 0);
  return {
    id: partial.id,
    code: partial.code,
    version: 1,
    status: { code: partial.status, semantic: partial.semantic },
    agency_id: partial.id,
    agency: {
      id: partial.id,
      code: `AG${String(partial.id).padStart(4, "0")}`,
      name: partial.agency_name,
      phone: null,
      contact_name: null,
    },
    created_by: { id: 95, code: "UFA_095", name: "Nguyễn Phước Nghiệp" },
    created_at: partial.created_at,
    updated_at: partial.updated_at,
    locked_at: null,
    delivery_address: {
      address: partial.address,
      label: "Địa chỉ giao hàng",
      latitude: null,
      longitude: null,
      source_agency_address_id: null,
    },
    discount_amount: money(0),
    discount_percent: "0.0000",
    subtotal_amount: money(partial.total),
    shipping_amount: money(0),
    total_amount: money(partial.total),
    financial_revision: 1,
    financial_status: { code: 0, semantic: "PENDING" },
    financial_summary: {
      payment_status: received > 0 ? "PARTIAL" : "UNPAID",
      net_received_amount: money(received),
      outstanding_receivable_amount: money(0),
      overpaid_amount: money(0),
      payable_amount: money(partial.total),
      receivable_amount: money(0),
      received_amount: money(received),
      refunded_amount: money(0),
      remaining_amount: money(remaining),
    },
    warehouse_assignments: [],
    lines: partial.lines,
  };
}

/** Sample matching GET /api/v1/orders payload shape. */
export const ORDERS: Order[] = [
  order({
    id: 2,
    code: "ORD-20260906161414-6BC1FD",
    status: 0,
    semantic: "DRAFT",
    agency_name: "Công Ty Lam Agri",
    address: "Số 18 đường Trần Phú, Phường 1, TP. Vĩnh Long, Vĩnh Long",
    created_at: "2026-09-06T16:14:14.625793Z",
    updated_at: "2026-09-06T16:14:14.625793Z",
    total: 1_000_000,
    lines: [
      line({
        id: 2,
        sales_sku_code: "B0037CM25-DAPV",
        product_name: "DAP Vàng · Bao Bỉ Trái Cây · 25.000 kg",
        quantity: 100,
        unit_price: 10_000,
        packaging_name: "Bao Bỉ Trái Cây",
        core_name: "DAP Vàng",
      }),
    ],
  }),
  order({
    id: 4,
    code: "DH-240515",
    status: 1,
    semantic: "NEW",
    agency_name: "Đại lý Cần Thơ",
    address: "88 Nguyễn Trãi, Ninh Kiều, Cần Thơ",
    created_at: "2024-05-15T07:45:00+07:00",
    updated_at: "2024-05-15T07:45:00+07:00",
    total: 15_850_000,
    lines: [
      line({
        id: 41,
        sales_sku_code: "NPK202015-B0001-DM-M-001-50",
        product_name: "NPK 20-20-15 Hạt ép Bao Kangaroo Úc màu Đỏ 50kg",
        quantity: 15,
        unit_price: 500_000,
      }),
    ],
  }),
  order({
    id: 1,
    code: "DH-240518",
    status: 8,
    semantic: "COMPLETED",
    agency_name: "Đại lý Hà Nội",
    address: "12 Láng Hạ, Đống Đa, Hà Nội",
    created_at: "2024-05-18T10:20:00+07:00",
    updated_at: "2024-05-20T14:05:00+07:00",
    total: 9_250_000,
    received: 9_000_000,
    remaining: 250_000,
    lines: [
      line({
        id: 11,
        sales_sku_code: "NPK-301010MSOP",
        product_name: "NPK 30-10-10 Bao 25kg",
        quantity: 10,
        unit_price: 500_000,
      }),
    ],
  }),
];
