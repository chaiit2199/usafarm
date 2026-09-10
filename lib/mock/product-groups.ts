export type ProductGroup = {
  id: number;
  code: string;
  name: string;
  childTypeCount: number;
};

export const MOCK_PRODUCT_GROUPS: ProductGroup[] = [
  { id: 1, code: "NPK", name: "Hỗn hợp phân bón NPK", childTypeCount: 2 },
  { id: 2, code: "DAP", name: "DAP", childTypeCount: 1 },
  { id: 3, code: "URE", name: "Urê", childTypeCount: 0 },
  { id: 4, code: "KL", name: "Kali", childTypeCount: 1 },
  { id: 5, code: "HM", name: "Humic", childTypeCount: 1 },
  { id: 6, code: "SA", name: "Sunphat Amon", childTypeCount: 1 },
  { id: 7, code: "CAN", name: "CAN", childTypeCount: 0 },
  { id: 8, code: "MAP", name: "MAP", childTypeCount: 2 },
  { id: 9, code: "SSP", name: "Supe lân đơn", childTypeCount: 1 },
  { id: 10, code: "ORG", name: "Phân hữu cơ", childTypeCount: 3 },
  { id: 11, code: "MIC", name: "Vi lượng", childTypeCount: 2 },
  { id: 12, code: "BIO", name: "Phân sinh học", childTypeCount: 1 },
];
