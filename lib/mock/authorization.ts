export type Warehouse = {
  code: string;
  name: string;
};

export const MOCK_WAREHOUSES: Warehouse[] = [
  { code: "DEMO_WH_LA", name: "Kho khu vực Long An" },
  { code: "DEMO_WH_TG", name: "Kho khu vực Tiền Giang" },
  { code: "DEMO_WH_VL", name: "Kho khu vực Vĩnh Long" },
];

export function warehouseOptionLabel(code: string): string {
  const warehouse = MOCK_WAREHOUSES.find((item) => item.code === code);
  return warehouse ? `${warehouse.code} — ${warehouse.name}` : code;
}
