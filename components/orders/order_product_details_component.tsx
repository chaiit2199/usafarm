"use client";

import { useMemo, useState } from "react";

import { Modal, TableHead } from "@/components/core_component";
import { Icon } from "@/components/icon";

type OrderProductDetailsComponentProps = {
  onClose: () => void;
};

type ProductMaterial = {
  id: number;
  code: string;
  name: string;
  weight: number;
};

const TARGET_WEIGHT = 50;

const INITIAL_ROWS: ProductMaterial[] = [
  { id: 1, code: "NL-30", name: "Đạm", weight: 30 },
  { id: 2, code: "NL-10", name: "Lân", weight: 10 },
  { id: 3, code: "NL-10B", name: "Kali", weight: 10 },
];

export function OrderProductDetailsComponent({ onClose }: OrderProductDetailsComponentProps) {
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [editingRowId, setEditingRowId] = useState<number | null>(null);

  const totalWeight = useMemo(
    () => rows.reduce((sum, row) => sum + row.weight, 0),
    [rows],
  );
  const isValidWeight = totalWeight === TARGET_WEIGHT;
  const weightError =
    totalWeight < TARGET_WEIGHT
      ? "Tổng khối lượng nguyên liệu chưa đạt 50kg. Vui lòng bổ sung đúng định lượng."
      : totalWeight > TARGET_WEIGHT
        ? "Tổng khối lượng nguyên liệu đã vượt 50kg. Vui lòng điều chỉnh lại định lượng."
        : "";

  function handleWeightChange(id: number, value: string) {
    const weight = Number(value);

    setRows((current) =>
      current.map((row) =>
        row.id === id ? { ...row, weight: Number.isFinite(weight) ? weight : 0 } : row,
      ),
    );
  }

  function handleEditRow(id: number) {
    setEditingRowId(id);
  }

  function handleDoneEdit() {
    setEditingRowId(null);
  }

  function updateNguyenLieu() {
    onClose();
  }

  return (
    <Modal
      id="order-product-details-modal"
      show
      width="2xl"
      title="Sản phẩm NPK 30-10-10 Bao 25kg - NPK 30-10-10"
      subtitle="Nguyên liệu được sử dụng để sản xuất sản phẩm"
      onClose={onClose}
      onBack={onClose}
    >
      <div className="core_modal__form">
        <div>
          <div className="overview-table-inner">
            <table className="overview-table min-w-full" id="order-product-details-table">
              <colgroup>
                <col style={{ width: "25%" }} />
                <col style={{ width: "40%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "15%" }} />
              </colgroup>
              <thead>
                <tr>
                  <TableHead icon="hero-hashtag">Mã nguyên liệu</TableHead>
                  <TableHead icon="hero-beaker">Tên nguyên liệu</TableHead>
                  <TableHead icon="hero-scale">Khối lượng</TableHead>
                  <th className="actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isEditing = editingRowId === row.id;

                  return (
                    <tr key={row.id}>
                      <td className="overview-table__muted">{row.code}</td>
                      <td>{row.name}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step="10"
                          value={row.weight}
                          disabled={!isEditing}
                          className="core_input core_input--sm core_input--disabled w-full"
                          onChange={(event) => handleWeightChange(row.id, event.target.value)}
                        />
                      </td>
                      <td className="actions">
                        <div className="admin-actions">
                          {isEditing ? (
                            <button
                              type="button"
                              className="admin-actions__btn"
                              aria-label="Xong"
                              onClick={handleDoneEdit}
                            >
                              <Icon name="hero-check" className="size-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="admin-actions__btn"
                              aria-label="Chỉnh sửa"
                              onClick={() => handleEditRow(row.id)}
                            >
                              <Icon name="hero-pencil-square" className="size-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="h-4">
            {!isValidWeight && (
              <p className="core_field__error">
                {weightError}
              </p>
            )}
          </div>
        </div>

        <div className="core_modal__actions">
          <button type="button" className="core_button core_button--secondary" onClick={onClose}>
            Đóng
          </button>
          <button
            type="button"
            className="core_button core_button--primary"
            onClick={updateNguyenLieu}
            disabled={!isValidWeight}
          >
            Lưu
          </button>
        </div>
      </div>
    </Modal>
  );
}
