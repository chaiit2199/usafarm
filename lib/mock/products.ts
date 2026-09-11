export type ProductOwnership = "CT" | "DL";

export type BomLine = {
  group: string;
  materialCode: string;
  materialName: string;
  quota: number;
  unit: string;
  chargeable: boolean;
};

export type BomConfig = {
  lines: BomLine[];
  wasteRate: number;
};

export type CatalogProduct = {
  id: number;
  sku: string;
  name: string;
  ownership: ProductOwnership;
  listedOnApp: boolean;
  bom: BomConfig;
};

export function ownershipShort(ownership: ProductOwnership) {
  return ownership === "CT" ? "Bao CT" : "Bao ĐL";
}

export function ownershipFull(ownership: ProductOwnership) {
  return ownership === "CT" ? "Bao bì của công ty (CT)" : "Bao bì của đại lý (ĐL)";
}

function bagBom(code: string, name: string, weightKg: number): BomConfig {
  return {
    wasteRate: 0,
    lines: [
      {
        group: "Vỏ bao bì",
        materialCode: code,
        materialName: name,
        quota: 1,
        unit: "CÁI",
        chargeable: true,
      },
      {
        group: "Ruột thô",
        materialCode: "NVL-001",
        materialName: "Nguyên liệu thô hạt ép",
        quota: weightKg,
        unit: "KG",
        chargeable: true,
      },
    ],
  };
}

export const MOCK_CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 1,
    sku: "DAP-B0001-D-M-D-50",
    name: "DAP DAP Hạt Đen Bao Bao Kangaroo Úc màu Đỏ 50kg",
    ownership: "CT",
    listedOnApp: true,
    bom: bagBom("B0001", "Bao Kangaroo Úc màu Đỏ 50 KG", 50),
  },
  {
    id: 2,
    sku: "DAP-B0002-XL-M-D-50",
    name: "DAP DAP Hạt Đen Bao Bao Kangaroo Úc màu Xanh lá 50kg",
    ownership: "CT",
    listedOnApp: true,
    bom: bagBom("B0002", "Bao Kangaroo Úc màu Xanh lá 50 KG", 50),
  },
  {
    id: 3,
    sku: "DAP-B0003-C-M-D-25",
    name: "DAP DAP Hạt Đen Bao Bao Korea 01 màu Cam 25kg",
    ownership: "CT",
    listedOnApp: true,
    bom: bagBom("B0003", "Bao Korea 01 màu Cam 25 KG", 25),
  },
  {
    id: 4,
    sku: "DAP-B0004-XL-M-D-25",
    name: "DAP DAP Hạt Đen Bao Bao Én UF màu Xanh lá 25kg",
    ownership: "CT",
    listedOnApp: true,
    bom: bagBom("B0004", "Bao Én UF màu Xanh lá 25 KG", 25),
  },
  {
    id: 5,
    sku: "DAP-B0005-XN-M-D-25",
    name: "DAP DAP Hạt Đen Bao Bao Én UF màu ngọc 25kg",
    ownership: "CT",
    listedOnApp: true,
    bom: bagBom("B0005", "Bao Én UF màu ngọc 25 KG", 25),
  },
  {
    id: 6,
    sku: "DAP-B0006-SXC-M-D-50",
    name: "DAP DAP Hạt Đen Bao Bao Korea màu Sọc xanh cam 50kg",
    ownership: "CT",
    listedOnApp: true,
    bom: bagBom("B0006", "Bao Korea màu Sọc xanh cam 50 KG", 50),
  },
  {
    id: 7,
    sku: "DAP-B0007-SXV-M-D-50",
    name: "DAP DAP Hạt Đen Bao Bao Korea màu Sọc xanh vàng 50kg",
    ownership: "CT",
    listedOnApp: true,
    bom: bagBom("B0007", "Bao Korea màu Sọc xanh vàng 50 KG", 50),
  },
  {
    id: 8,
    sku: "DAP-B0008-SDC-M-D-50",
    name: "DAP DAP Hạt Đen Bao Bao Korea màu Sọc đen cam 50kg",
    ownership: "CT",
    listedOnApp: true,
    bom: bagBom("B0008", "Bao Korea màu Sọc đen cam 50 KG", 50),
  },
];
