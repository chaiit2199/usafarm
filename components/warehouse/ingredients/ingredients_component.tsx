"use client";

import { useEffect, useMemo, useState } from "react";

import { Modal, Pagination, TableHead } from "@/components/core_component";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import { IngredientsSummaryComponent } from "@/components/warehouse/ingredients/ingredients_summary_component";
import { Icon } from "@/components/icon";

type Ingredient = {
  id: number;
  code: string;
  warehouseCode: string;
  name: string;
  stockKg: number;
  reservedKg: number;
  packLabel: string;
  packBags: number;
  packPercent: number;
};

const MOCK_INGREDIENTS: Ingredient[] = [
  {
    id: 1,
    code: "NVL-NPK202015",
    warehouseCode: "K01",
    name: "Nguyên liệu trộn A",
    stockKg: 10000,
    reservedKg: 0,
    packLabel: "Bao 25kg",
    packBags: 1200,
    packPercent: 100,
  },
  {
    id: 2,
    code: "NVL-CASE4",
    warehouseCode: "K02",
    name: "Nguyên liệu thô NPK 20-20-15 – minh họa case 4",
    stockKg: 8000,
    reservedKg: 2000,
    packLabel: "Bao 50kg",
    packBags: 160,
    packPercent: 100,
  },
  {
    id: 3,
    code: "NVL-CASE5",
    warehouseCode: "K03",
    name: "Nguyên liệu thô NPK 20-20-15 – minh họa case 5",
    stockKg: 6500,
    reservedKg: 500,
    packLabel: "Bao 50kg",
    packBags: 130,
    packPercent: 100,
  },
  {
    id: 4,
    code: "NVL-CASE6",
    warehouseCode: "K04",
    name: "Nguyên liệu thô NPK 20-20-15 – minh họa case 6",
    stockKg: 12000,
    reservedKg: 0,
    packLabel: "Bao 25kg",
    packBags: 480,
    packPercent: 100,
  },
  {
    id: 5,
    code: "NVL-CASE7",
    warehouseCode: "K07",
    name: "Nguyên liệu thô NPK 20-20-15 – minh họa case 7",
    stockKg: 10000,
    reservedKg: 0,
    packLabel: "Bao 50kg",
    packBags: 200,
    packPercent: 100,
  },
  {
    id: 6,
    code: "NVL-CASE8",
    warehouseCode: "K08",
    name: "Nguyên liệu thô NPK 20-20-15 – minh họa case 8",
    stockKg: 8000,
    reservedKg: 2000,
    packLabel: "Bao 50kg",
    packBags: 160,
    packPercent: 100,
  },
  {
    id: 7,
    code: "NVL-CASE9",
    warehouseCode: "K09",
    name: "Nguyên liệu thô NPK 20-20-15 – minh họa case 9",
    stockKg: 4500,
    reservedKg: 1000,
    packLabel: "Bao 25kg",
    packBags: 180,
    packPercent: 100,
  },
];

function formatKg(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} KG`;
}

function WarehouseCodeBadge({ code }: { code: string }) {
  return <span className="status status--active">{code}</span>;
}

function IngredientDetailModal({
  item,
  onClose,
}: {
  item: Ingredient;
  onClose: () => void;
}) {
  return (
    <Modal id="ingredient-detail-modal" show title={item.name} width="md" onClose={onClose}>
      <div className="core_modal__form">
        <p className="text-sm text-theme-muted">
          Mã: <span className="font-semibold text-slate-900">{item.code}</span>. Kho:{" "}
          <span className="font-semibold text-slate-900">{item.warehouseCode}</span>. Tồn:{" "}
          <span className="font-semibold text-slate-900">{formatKg(item.stockKg)}</span>. Đang giữ
          chỗ:{" "}
          <span className="font-semibold text-slate-900">{formatKg(item.reservedKg)}</span>.
        </p>
        <div className="core_modal__actions">
          <button type="button" className="core_button core_button--primary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}

export function IngredientsComponent() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selected, setSelected] = useState<Ingredient | null>(null);

  useEffect(() => {
    return subscribeHeaderAction("/warehouse/ingredients", (detail) => {
      if (detail.action === "search") {
        setSearch(detail.query ?? "");
        setPage(1);
      }
      if (detail.action === "create") {
        console.log("create_ingredient");
      }
    });
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return MOCK_INGREDIENTS;
    return MOCK_INGREDIENTS.filter((item) =>
      [item.code, item.warehouseCode, item.name, item.packLabel]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <IngredientsSummaryComponent />
      <section className="section" id="warehouse-ingredients-section">
        <div className="section-container section-table mb-6">
          <div className="overview-table-wrap">
            <div className="overview-table-inner">
              <table className="overview-table min-w-full" id="ingredients-table">
                <colgroup>
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "28%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <TableHead icon="hero-hashtag">Mã NVL</TableHead>
                    <TableHead icon="hero-inbox-stack">Kho tồn</TableHead>
                    <TableHead icon="hero-beaker">Tên khối nguyên liệu</TableHead>
                    <TableHead>Tồn kho</TableHead>
                    <TableHead>Quy đổi đầu ra dự kiến</TableHead>
                    <TableHead className="actions"></TableHead>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => (
                    <tr key={item.id} id={`ingredient-row-${item.id}`}>
                      <td className="overview-table__code">{item.code}</td>
                      <td>
                        <WarehouseCodeBadge code={item.warehouseCode} />
                      </td>
                      <td className="font-medium text-slate-900">{item.name}</td>
                      <td>
                        <p className="mb-0 font-medium text-slate-900">{formatKg(item.stockKg)}</p>
                        {item.reservedKg > 0 && (
                          <span className="status status--paused mt-1">
                            Giữ {formatKg(item.reservedKg)}
                          </span>
                        )}
                      </td>
                      <td className="overview-table__muted">
                        {item.packLabel}: {new Intl.NumberFormat("en-US").format(item.packBags)} bao (
                        {item.packPercent}%)
                      </td>
                      <td className="actions">
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
                        >
                          <Icon name="hero-eye" className="size-5 shrink-0" />
                        </button>
                      </td>
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

        {selected && <IngredientDetailModal item={selected} onClose={() => setSelected(null)} />}
      </section>
    </>
  );
}
