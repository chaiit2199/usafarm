export type ProductType = {
  id: number;
  groupCode: string;
  name: string;
  typeId: string;
  skuBase: string;
};

export const MOCK_PRODUCT_TYPES: ProductType[] = [
  { id: 1, groupCode: "DAP", name: "DAP", typeId: "", skuBase: "DAP" },
  { id: 2, groupCode: "NPK", name: "20-20-15", typeId: "202015", skuBase: "NPK202015" },
  { id: 3, groupCode: "NPK", name: "17-17-17", typeId: "171717", skuBase: "NPK171717" },
  { id: 4, groupCode: "NPK", name: "15-15-15", typeId: "151515", skuBase: "NPK151515" },
  { id: 5, groupCode: "NPK", name: "16-16-8", typeId: "161608", skuBase: "NPK161608" },
  { id: 6, groupCode: "NPK", name: "20-10-10", typeId: "201010", skuBase: "NPK201010" },
  { id: 7, groupCode: "NPK", name: "16-16-16", typeId: "161616", skuBase: "NPK161616" },
  { id: 8, groupCode: "NPK", name: "30-10-10", typeId: "301010", skuBase: "NPK301010" },
  { id: 9, groupCode: "NPK", name: "12-12-17", typeId: "121217", skuBase: "NPK121217" },
  { id: 10, groupCode: "NPK", name: "16-16-08", typeId: "161608B", skuBase: "NPK161608B" },
  { id: 11, groupCode: "NPK", name: "30-09-09", typeId: "300909", skuBase: "NPK300909" },
  { id: 12, groupCode: "NPK", name: "32-10-10", typeId: "321010", skuBase: "NPK321010" },
  { id: 13, groupCode: "URE", name: "Urê hạt đục", typeId: "URE01", skuBase: "UREURE01" },
  { id: 14, groupCode: "KL", name: "Kali đỏ", typeId: "KL01", skuBase: "KLKL01" },
];

export function productTypeLabel(type: ProductType) {
  return `${type.skuBase} — ${type.name}`;
}
