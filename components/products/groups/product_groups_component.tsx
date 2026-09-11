"use client";

import { useMemo, useState } from "react";

import { EmptyData, Pagination, TableHead } from "@/components/core_component";
import { MOCK_PRODUCT_GROUPS } from "@/lib/mock/product-groups";
import { Icon } from "@/components/icon";

function formatChildTypes(count: number) {
  return `${count} loại hàng`;
}

export function ProductGroupsComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const totalPages = Math.max(1, Math.ceil(MOCK_PRODUCT_GROUPS.length / pageSize));
  const pageItems = useMemo(
    () => MOCK_PRODUCT_GROUPS.slice((page - 1) * pageSize, page * pageSize),
    [page, pageSize],
  );

  return (
    <section className="section" id="product-groups-section">
      <div className="section-container section-table mb-6 ">
        {MOCK_PRODUCT_GROUPS.length === 0 ? (
          <EmptyData
            title="Không có nhóm sản phẩm"
            description="Chưa có nhóm hàng nào được tạo."
          />
        ) : (
          <div className="overview-table-wrap">
            <div className="overview-table-inner">
              <table className="overview-table min-w-full" id="product-groups-table">
                <colgroup>
                  <col style={{ width: "8%" }} />
                  <col style={{ width: "18%" }} />
                  <col style={{ width: "40%" }} />
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "10%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <TableHead></TableHead>
                    <TableHead>ID nhóm</TableHead>
                    <TableHead icon="hero-rectangle-stack">Tên nhóm sản phẩm gốc</TableHead>
                    <TableHead>Số loại hàng con (C2)</TableHead>
                    <TableHead></TableHead>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((group, index) => (
                    <tr key={group.id} id={`product-group-row-${group.code}`}>
                      <td className="overview-table__muted">
                        {(page - 1) * pageSize + index + 1}
                      </td>
                      <td>
                        <span className="status status--active">{group.code}</span>
                      </td>
                      <td className="font-medium text-slate-900">{group.name}</td>
                      <td className="overview-table__muted">
                        {formatChildTypes(group.childTypeCount)}
                      </td>
                      <td className="actions"> 
                        <button type="button" className="admin-actions__btn" aria-label="Chỉnh sửa">
                          <Icon name="hero-pencil-square" className="size-5" />
                        </button> 
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
