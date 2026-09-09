"use client";

import { useEffect, useMemo, useState } from "react";

import { Pagination, TableHead } from "@/components/core_component";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";

type FinishedGood = {
  id: number;
  sku: string;
  note: string;
  name: string;
  warehouseCode: string;
  ownership: string;
  stockBags: number;
};

const MOCK_FINISHED_GOODS: FinishedGood[] = [
  {
    id: 1,
    sku: "NPK202015-B0201-C-M-003-50",
    note: "Case 1 minh họa – tồn kho đủ, sản xuất cũng đủ",
    name: "NPK 20-20-15 Hạt Hạt tháp cao xanh lá Bao Bao minh họa Case 1 màu Cam 50kg",
    warehouseCode: "K01",
    ownership: "Bao CT",
    stockBags: 50,
  },
  {
    id: 2,
    sku: "NPK202015-B0202-C-M-003-50",
    note: "Case 2 minh họa – tồn kho đủ, sản xuất một phần",
    name: "NPK 20-20-15 Hạt Hạt tháp cao xanh lá Bao Bao minh họa Case 2 màu Tím 50kg",
    warehouseCode: "K02",
    ownership: "Bao CT",
    stockBags: 150,
  },
  {
    id: 3,
    sku: "NPK202015-B0203-C-M-003-50",
    note: "Case 3 minh họa – tồn kho đủ",
    name: "NPK 20-20-15 Hạt Hạt tháp cao xanh lá Bao Bao minh họa Case 3 màu Đỏ 50kg",
    warehouseCode: "K03",
    ownership: "Bao CT",
    stockBags: 60,
  },
  {
    id: 4,
    sku: "NPK202015-B0204-C-M-003-50",
    note: "Case 4 minh họa – tồn kho đủ",
    name: "NPK 20-20-15 Hạt Hạt tháp cao xanh lá Bao Bao minh họa Case 4 màu Xanh lá 50kg",
    warehouseCode: "K04",
    ownership: "Bao CT",
    stockBags: 50,
  },
  {
    id: 5,
    sku: "NPK202015-B0205-C-M-003-50",
    note: "Case 5 minh họa – tồn kho đủ",
    name: "NPK 20-20-15 Hạt Hạt tháp cao xanh lá Bao Bao minh họa Case 5 màu Xanh dương 50kg",
    warehouseCode: "K05",
    ownership: "Bao CT",
    stockBags: 150,
  },
  {
    id: 6,
    sku: "NPK202015-B0206-C-M-003-50",
    note: "Case 6 minh họa – tồn kho đủ",
    name: "NPK 20-20-15 Hạt Hạt tháp cao xanh lá Bao Bao minh họa Case 6 màu Vàng 50kg",
    warehouseCode: "K06",
    ownership: "Bao CT",
    stockBags: 60,
  },
];

function OwnershipBadge({ label }: { label: string }) {
  return <span className="status status--active">{label}</span>;
}

export function FinishedGoodsComponent() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    return subscribeHeaderAction("/warehouse/finished-goods", (detail) => {
      if (detail.action === "search") {
        setSearch(detail.query ?? "");
        setPage(1);
      }
      if (detail.action === "create") {
        console.log("create_finished_good");
      }
    });
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return MOCK_FINISHED_GOODS;
    return MOCK_FINISHED_GOODS.filter((item) =>
      [item.sku, item.note, item.name, item.warehouseCode, item.ownership]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="section" id="finished-goods-section">
      <div className="section-container section-table mb-6">
        <div className="overview-table-wrap">
          <div className="overview-table-inner">
            <table className="overview-table min-w-full" id="finished-goods-table">
              <colgroup>
                <col style={{ width: "26%" }} />
                <col style={{ width: "36%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "14%" }} />
              </colgroup>
              <thead>
                <tr>
                  <TableHead icon="hero-hashtag">Mã SKU thành phẩm</TableHead>
                  <TableHead icon="hero-cube">Tên sản phẩm thành phẩm</TableHead>
                  <TableHead icon="hero-inbox-stack">Kho lưu</TableHead>
                  <TableHead>Sở hữu</TableHead>
                  <TableHead>SL tồn</TableHead>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((item) => (
                  <tr key={item.id} id={`finished-good-row-${item.id}`}>
                    <td>
                      <p className="mb-0.5 font-medium text-slate-900">{item.sku}</p>
                      <p className="text-xs text-theme-muted">{item.note}</p>
                    </td>
                    <td className="font-medium text-slate-900">{item.name}</td>
                    <td className="overview-table__muted">{item.warehouseCode}</td>
                    <td>
                      <OwnershipBadge label={item.ownership} />
                    </td>
                    <td className="is-num font-medium text-slate-900">{item.stockBags} Bao</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </section>
  );
}
