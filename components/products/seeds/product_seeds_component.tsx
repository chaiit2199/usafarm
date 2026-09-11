"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { createPortal } from "react-dom";

import {
  EmptyData,
  Input,
  Modal,
  Pagination,
  TableHead,
} from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { RequiredLabel, SelectField } from "@/components/form-fields";
import { Icon } from "@/components/icon";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import {
  MOCK_PRODUCT_TYPES,
  productTypeLabel,
  type ProductType,
} from "@/lib/mock/product-types";

type SeedKind = "single" | "blend";

type ProductSeed = {
  id: number;
  code: string;
  name: string;
  kind: SeedKind;
  material: string;
  productTypeSkus: string[];
};

type CreateSeedPayload = {
  code: string;
  name: string;
  kind: SeedKind;
  material: string;
  productTypeSkus: string[];
};

const MOCK_MATERIALS = [
  { id: "mat-ep", label: "Nguyên liệu thô hạt ép" },
  { id: "mat-thap", label: "Nguyên liệu thô hạt tháp" },
  { id: "mat-hoi", label: "Nguyên liệu thô hạt hơi nước" },
  { id: "mat-bot", label: "Nguyên liệu thô dạng bột" },
];

const DEFAULT_APPLIED = [
  "NPK202015",
  "NPK171717",
  "NPK301010",
  "NPK300909",
  "NPK321010",
];

const MOCK_SEEDS: ProductSeed[] = [
  {
    id: 1,
    code: "001",
    name: "hạt ép",
    kind: "single",
    material: "Nguyên liệu thô hạt ép",
    productTypeSkus: DEFAULT_APPLIED,
  },
  {
    id: 2,
    code: "002",
    name: "hạt tháp cao",
    kind: "single",
    material: "Nguyên liệu thô hạt ép",
    productTypeSkus: DEFAULT_APPLIED,
  },
  {
    id: 3,
    code: "003",
    name: "hạt tháp cao xanh lá",
    kind: "single",
    material: "Nguyên liệu thô hạt ép",
    productTypeSkus: DEFAULT_APPLIED,
  },
  {
    id: 4,
    code: "004",
    name: "hạt tháp cao tím",
    kind: "single",
    material: "Nguyên liệu thô hạt ép",
    productTypeSkus: DEFAULT_APPLIED,
  },
  {
    id: 5,
    code: "005",
    name: "hạt hơi nước",
    kind: "single",
    material: "Nguyên liệu thô hạt ép",
    productTypeSkus: ["NPK202015", "NPK171717", "NPK151515"],
  },
  {
    id: 6,
    code: "006",
    name: "hạt phối trộn mẫu",
    kind: "blend",
    material: "Công thức phối trộn nhiều nguyên liệu",
    productTypeSkus: ["NPK201010", "NPK301010"],
  },
];

function seedKindLabel(kind: SeedKind) {
  return kind === "single" ? "Hạt đơn" : "Hạt phối trộn";
}

function resolveProductTypes(skus: string[]) {
  return skus
    .map((sku) => MOCK_PRODUCT_TYPES.find((type) => type.skuBase === sku))
    .filter((type): type is ProductType => type != null);
}

function ProductTypeMultiSelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const selectedTypes = resolveProductTypes(value);
  const availableTypes = MOCK_PRODUCT_TYPES.filter((type) => !value.includes(type.skuBase));

  function updateMenuPosition() {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 4;
    const maxHeight = Math.min(320, window.innerHeight - rect.bottom - gap - 12);
    const width = rect.width;

    setMenuStyle({
      position: "fixed",
      top: rect.bottom + gap,
      left: rect.left,
      width,
      maxHeight: Math.max(160, maxHeight),
      zIndex: 80,
    });
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    function handleReposition() {
      updateMenuPosition();
    }

    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);
    return () => {
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, value.length]);

  function addType(sku: string) {
    if (value.includes(sku)) return;
    onChange([...value, sku]);
  }

  function removeType(sku: string) {
    onChange(value.filter((item) => item !== sku));
  }

  const menu = open
    ? createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className="overflow-y-auto rounded-xl border border-theme-primary-border bg-white p-1 shadow-lg"
        >
          <p className="px-3 py-2 text-sm font-medium text-theme-primary">
            ✓ Chọn thêm loại hàng...
          </p>
          {availableTypes.length === 0 ? (
            <p className="px-3 py-2 text-sm text-theme-muted">Đã chọn hết loại hàng.</p>
          ) : (
            availableTypes.map((type) => (
              <button
                key={type.skuBase}
                type="button"
                className="block w-full rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-theme-primary/5"
                onClick={() => addType(type.skuBase)}
              >
                {productTypeLabel(type)}
              </button>
            ))
          )}
        </div>,
        document.body,
      )
    : null;

  return (
    <div className="core_field col-span-2" ref={rootRef}>
      <label className="core_label">
        <RequiredLabel>Loại hàng áp dụng (1 hạt có thể dùng cho nhiều loại hàng)</RequiredLabel>
      </label>

      <div
        ref={triggerRef}
        className={[
          "core_input !h-auto min-h-11 w-full flex flex-wrap items-center gap-1.5 py-2",
          open ? "border-theme-primary ring-1 ring-theme-primary/30" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setOpen(true)}
      >
        {selectedTypes.map((type) => (
          <span
            key={type.skuBase}
            className="inline-flex max-w-full items-center gap-1 rounded-full border border-theme-primary/40 bg-theme-primary/5 px-2 py-0.5 text-xs font-medium text-theme-primary"
          >
            <span className="truncate">{productTypeLabel(type)}</span>
            <button
              type="button"
              className="shrink-0 rounded-full p-0.5 hover:bg-theme-primary/10"
              aria-label={`Bỏ ${type.skuBase}`}
              onClick={(event) => {
                event.stopPropagation();
                removeType(type.skuBase);
              }}
            >
              <Icon name="hero-x-mark" className="size-3.5" />
            </button>
          </span>
        ))}

        <button
          type="button"
          className="text-sm text-theme-muted"
          onClick={(event) => {
            event.stopPropagation();
            setOpen((current) => !current);
          }}
        >
          Chọn thêm loại hàng...
        </button>
      </div>

      {menu}
    </div>
  );
}

function CreateSeedModal({ onClose }: { onClose: () => void }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [payload, setPayload] = useState<CreateSeedPayload | null>(null);
  const [kind, setKind] = useState<SeedKind>("single");
  const [productTypeSkus, setProductTypeSkus] = useState<string[]>([]);

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const code = String(data.code ?? "").trim();
    const name = String(data.name ?? "").trim();
    const material = String(data.material ?? "").trim();
    if (!code || !name || !material || productTypeSkus.length === 0) return;

    setPayload({
      code,
      name,
      kind,
      material,
      productTypeSkus,
    });
    setIsConfirmOpen(true);
  }

  function confirmCreate() {
    setIsConfirmOpen(false);
    onClose();
  }

  return (
    <>
      <Modal
        id="create-product-seed-modal"
        show
        title="Thêm loại hạt"
        closeable={!isConfirmOpen}
        width="2xl"
        onClose={onClose}
      >
        <form
          id="create-product-seed-form"
          className="core_modal__form overflow-hidden -mx-4"
          autoComplete="off"
          onSubmit={handleFormSubmit}
        >
          <div className="admin-user-form gap-4 overflow-y-auto flex-auto h-full px-4">
            <Input
              id="create-seed-code"
              name="code"
              label={<RequiredLabel>Mã hạt</RequiredLabel>}
              placeholder="018"
              required
            />
            <Input
              id="create-seed-name"
              name="name"
              label={<RequiredLabel>Tên hạt</RequiredLabel>}
              placeholder="Ví dụ: Hạt tháp cao xanh lá"
              required
            />

            <fieldset className="core_field">
              <legend className="core_label">
                <RequiredLabel>Phân loại hạt</RequiredLabel>
              </legend>
              <div className="flex gap-2">
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="kind"
                    value="single"
                    checked={kind === "single"}
                    onChange={() => setKind("single")}
                  />
                  Hạt đơn (không cần phối trộn)
                </label>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="radio"
                    name="kind"
                    value="blend"
                    checked={kind === "blend"}
                    onChange={() => setKind("blend")}
                  />
                  Hạt phối trộn (cần công thức nhiều nguyên liệu)
                </label>
              </div>
            </fieldset>

            <div>
              <SelectField
                id="create-seed-material"
                name="material"
                label={<RequiredLabel>Nguyên liệu thô tương ứng</RequiredLabel>}
                defaultValue=""
                required
              >
                <option value="">Chọn nguyên liệu</option>
                {MOCK_MATERIALS.map((material) => (
                  <option key={material.id} value={material.label}>
                    {material.label}
                  </option>
                ))}
              </SelectField>
              <p className="mt-1.5 text-xs text-theme-muted">
                {kind === "single"
                  ? 'Hạt đơn dùng thẳng 1 nguyên liệu thô, không cần công thức phối trộn. Chưa có nguyên liệu cần dùng? Bấm "Tạo nhanh".'
                  : "Hạt phối trộn cần khai báo công thức nhiều nguyên liệu."}
              </p>
            </div>

            <ProductTypeMultiSelect value={productTypeSkus} onChange={setProductTypeSkus} />
          </div>

          <div className="core_modal__actions px-4">
            <button type="button" className="core_button core_button--secondary" onClick={onClose}>
              Hủy
            </button>
            <FormSubmitButton>Tạo mới</FormSubmitButton>
          </div>
        </form>
      </Modal>

      <Modal
        id="create-product-seed-confirm-modal"
        show={isConfirmOpen}
        title="Xác nhận thêm loại hạt"
        width="md"
        className="core_modal--stacked"
        onClose={() => setIsConfirmOpen(false)}
      >
        <form className="core_modal__form" action={confirmCreate}>
          <p className="text-sm text-theme-muted">
            Bạn có chắc muốn thêm loại hạt{" "}
            <span className="font-semibold text-slate-900">{payload?.name}</span> (mã{" "}
            <span className="font-semibold text-slate-900">{payload?.code}</span>) với{" "}
            <span className="font-semibold text-slate-900">
              {payload?.productTypeSkus.length ?? 0}
            </span>{" "}
            loại hàng áp dụng?
          </p>
          <div className="core_modal__actions">
            <button
              type="button"
              className="core_button core_button--secondary"
              onClick={() => setIsConfirmOpen(false)}
            >
              Hủy
            </button>
            <FormSubmitButton>Xác nhận</FormSubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}

export function ProductSeedsComponent() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  useEffect(() => {
    return subscribeHeaderAction("/products/seeds", (detail) => {
      if (detail.action === "create") setIsCreateOpen(true);
    });
  }, []);

  const totalPages = Math.max(1, Math.ceil(MOCK_SEEDS.length / pageSize));
  const pageItems = useMemo(
    () => MOCK_SEEDS.slice((page - 1) * pageSize, page * pageSize),
    [page, pageSize],
  );

  return (
    <section className="section" id="product-seeds-section">
      <div className="section-container section-table mb-6 ">
        {MOCK_SEEDS.length === 0 ? (
          <EmptyData title="Không có loại hạt" description="Chưa có loại hạt nào được tạo." />
        ) : (
          <div className="overview-table-wrap">
            <div className="overview-table-inner">
              <table className="overview-table min-w-[1100px]" id="product-seeds-table">
                <colgroup>
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "26%" }} />
                  <col style={{ width: "30%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <TableHead>STT</TableHead>
                    <TableHead icon="hero-hashtag">Mã hạt</TableHead>
                    <TableHead icon="hero-sparkles">Tên hạt</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead icon="hero-beaker">Nguyên liệu / Công thức phối trộn</TableHead>
                    <TableHead icon="hero-tag">Loại hàng áp dụng</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((seed, index) => {
                    const appliedTypes = resolveProductTypes(seed.productTypeSkus);
                    return (
                      <tr key={seed.id} id={`product-seed-row-${seed.code}`}>
                        <td className="overview-table__muted">
                          {(page - 1) * pageSize + index + 1}
                        </td>
                        <td className="overview-table__code">{seed.code}</td>
                        <td className="font-medium text-slate-900">{seed.name}</td>
                        <td>
                          <span className="status status--active">{seedKindLabel(seed.kind)}</span>
                        </td>
                        <td className="overview-table__muted">{seed.material}</td>
                        <td>
                          <div className="flex flex-wrap items-center gap-1">
                            {appliedTypes.map((type) => (
                              <span key={type.skuBase} className="dash-tag">
                                {productTypeLabel(type)}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
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

      {isCreateOpen ? <CreateSeedModal onClose={() => setIsCreateOpen(false)} /> : null}
    </section>
  );
}
