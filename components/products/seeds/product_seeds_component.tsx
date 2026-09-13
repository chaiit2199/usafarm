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
import { Status } from "@/components/status";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import {
  MOCK_PRODUCT_TYPES,
  productTypeLabel,
  type ProductType,
} from "@/lib/mock/product-types";

type SeedKind = "single" | "blend";

type BlendLine = {
  id: string;
  materialId: string;
  percent: number;
};

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
  blendLines?: BlendLine[];
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

const SEED_KIND_META = {
  single: {
    label: "Hạt đơn",
    description: "Dùng 1 nguyên liệu thô, không cần công thức phối trộn.",
    color: "#059669",
  },
  blend: {
    label: "Hạt phối trộn",
    description: "Nhiều nguyên liệu thô, tổng tỷ lệ không vượt quá 100%.",
    color: "#7C3AED",
  },
} as const;

function seedKindLabel(kind: SeedKind) {
  return SEED_KIND_META[kind].label;
}

function SeedKindBadge({ kind }: { kind: SeedKind }) {
  return (
    <Status color={SEED_KIND_META[kind].color}>
      {seedKindLabel(kind)}
    </Status>
  );
}

function newBlendLine(percent = 0): BlendLine {
  return { id: crypto.randomUUID(), materialId: "", percent };
}

function blendTotal(lines: BlendLine[]) {
  return lines.reduce((sum, line) => sum + Number(line.percent || 0), 0);
}

function isBlendRecipeValid(lines: BlendLine[]) {
  if (lines.length < 2) return false;

  const ids = lines.map((line) => line.materialId);
  const hasEmpty = ids.some((id) => !id);
  const hasDuplicate = new Set(ids).size !== ids.length;
  const hasInvalidPercent = lines.some((line) => Number(line.percent) <= 0);

  return !hasEmpty && !hasDuplicate && !hasInvalidPercent && Math.abs(blendTotal(lines) - 100) < 0.01;
}

function formatBlendMaterial(lines: BlendLine[]) {
  return lines
    .map((line) => {
      const material = MOCK_MATERIALS.find((item) => item.id === line.materialId);
      return material ? `${material.label} ${line.percent}%` : "";
    })
    .filter(Boolean)
    .join(" + ");
}

function SeedKindCards({
  value,
  onChange,
}: {
  value: SeedKind;
  onChange: (kind: SeedKind) => void;
}) {
  return (
    <fieldset className="core_field col-span-2">
      <legend className="core_label">
        <RequiredLabel>Phân loại hạt</RequiredLabel>
      </legend>
      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(SEED_KIND_META) as SeedKind[]).map((kind) => {
          const option = SEED_KIND_META[kind];
          const selected = value === kind;

          return (
            <button
              key={kind}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(kind)}
              className={[
                "rounded-xl border p-3.5 text-left transition",
                selected ? "" : "border-theme-primary-border hover:bg-slate-50",
              ].join(" ")}
              style={
                selected
                  ? {
                      borderColor: `${option.color}88`,
                      backgroundColor: `${option.color}14`,
                    }
                  : undefined
              }
            >
              <span className="flex items-start justify-between gap-2">
                <span className="flex items-center gap-2"> 
                  <span className="text-sm font-semibold text-slate-900">{option.label}</span>
                </span>
                {selected ? (
                  <span style={{ color: option.color }}>
                    <Icon name="hero-check-circle-mini" className="size-5" />
                  </span>
                ) : null}
              </span>
              <p className="mt-1.5 text-xs leading-5 text-theme-muted">{option.description}</p>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function BlendRecipeField({
  lines,
  onChange,
}: {
  lines: BlendLine[];
  onChange: (next: BlendLine[]) => void;
}) {
  const total = blendTotal(lines);
  const isExact = Math.abs(total - 100) < 0.01;
  const canAdd = lines.length < MOCK_MATERIALS.length;

  function updateLine(id: string, patch: Partial<BlendLine>) {
    onChange(lines.map((line) => (line.id === id ? { ...line, ...patch } : line)));
  }

  return (
    <div className="col-span-2 rounded-xl border border-theme-primary-border bg-slate-50/70 p-4">
      <p className="text-sm font-semibold text-slate-900">Công thức phối trộn</p>
      <p className="mt-0.5 text-xs text-theme-muted">
        Chọn các nguyên liệu thô cấu thành và tỷ lệ % — tổng không vượt quá 100%.
      </p>

      <div className="mt-3 grid grid-cols-[minmax(0,1fr)_6.5rem_2.5rem] items-center gap-2 text-xs font-medium text-theme-muted">
        <span>Nguyên liệu thô</span>
        <span>Tỷ lệ %</span>
        <span />
      </div>

      <div className="mt-1.5 space-y-2">
        {lines.map((line) => {
          const usedIds = lines
            .filter((item) => item.id !== line.id)
            .map((item) => item.materialId)
            .filter(Boolean);

          return (
            <div
              key={line.id}
              className="grid grid-cols-[minmax(0,1fr)_80px_2.5rem] items-center gap-2"
            >
              <select
                value={line.materialId}
                required
                onChange={(event) => updateLine(line.id, { materialId: event.target.value })}
                className="core_input core_input--select w-full"
              >
                <option value="">Chọn nguyên liệu</option>
                {MOCK_MATERIALS.map((material) => (
                  <option
                    key={material.id}
                    value={material.id}
                    disabled={usedIds.includes(material.id)}
                  >
                    {material.label}
                  </option>
                ))}
              </select>

              <input
                type="number"
                min={0}
                max={100}
                step={1}
                required
                value={Number.isFinite(line.percent) ? line.percent : 0}
                onChange={(event) =>
                  updateLine(line.id, { percent: Number(event.target.value) || 0 })
                }
                className="core_input w-full text-center"
              />

              <button
                type="button"
                aria-label="Xóa nguyên liệu"
                onClick={() => onChange(lines.filter((item) => item.id !== line.id))}
                className="inline-flex size-10 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50"
              >
                <Icon name="hero-x-mark" className="size-4" />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={!canAdd}
          onClick={() => onChange([...lines, newBlendLine(0)])}
          className="inline-flex items-center gap-1 rounded-lg border border-theme-primary-border bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Icon name="hero-plus" className="size-4" />
          Thêm nguyên liệu
        </button>

        <p className={`text-sm font-medium ${isExact ? "text-emerald-600" : "text-rose-600"}`}>
          Tổng: {total}%
          {isExact
            ? " - đạt 100%"
            : total > 100
              ? " - không vượt quá 100%"
              : " - chưa đủ 100%"}
        </p>
      </div>
    </div>
  );
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
  const [blendLines, setBlendLines] = useState<BlendLine[]>(() => [
    newBlendLine(),
    newBlendLine(),
  ]);
  const [productTypeSkus, setProductTypeSkus] = useState<string[]>([]);

  function handleKindChange(next: SeedKind) {
    if (next === kind) return;
    setKind(next);
    if (next === "blend") {
      setBlendLines([newBlendLine(), newBlendLine()]);
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    const code = String(data.code ?? "").trim();
    const name = String(data.name ?? "").trim();
    const material =
      kind === "blend"
        ? formatBlendMaterial(blendLines)
        : String(data.material ?? "").trim();

    if (!code || !name || !material || productTypeSkus.length === 0) return;
    if (kind === "blend" && !isBlendRecipeValid(blendLines)) return;

    setPayload({
      code,
      name,
      kind,
      material,
      productTypeSkus,
      blendLines: kind === "blend" ? blendLines : undefined,
    });
    setIsConfirmOpen(true);
  }

  function confirmCreate() {
    console.log(payload);
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

            <SeedKindCards value={kind} onChange={handleKindChange} />

            {kind === "single" ? (
              <div className="col-span-2">
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
                  Hạt đơn dùng thẳng 1 nguyên liệu thô, không cần công thức phối trộn.
                </p>
              </div>
            ) : (
              <BlendRecipeField lines={blendLines} onChange={setBlendLines} />
            )}

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
            <span className="font-semibold text-slate-900">{payload?.code}</span>
            {payload ? `, ${seedKindLabel(payload.kind).toLowerCase()}` : ""}) với{" "}
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
                    <TableHead></TableHead>
                    <TableHead icon="hero-hashtag">Mã hạt</TableHead>
                    <TableHead icon="hero-swatch">Tên hạt</TableHead>
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
                          <SeedKindBadge kind={seed.kind} />
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
