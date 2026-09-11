"use client";

import { useEffect, useMemo, useState } from "react";

import {
  EmptyData,
  Input,
  Modal,
  Pagination,
  TableHead,
} from "@/components/core_component";
import { FormSubmitButton } from "@/components/form-submit-button";
import { Icon } from "@/components/icon";
import { subscribeHeaderAction } from "@/lib/dashboard/header-actions";
import {
  MOCK_CATALOG_PRODUCTS,
  ownershipFull,
  ownershipShort,
  type BomConfig,
  type BomLine,
  type CatalogProduct,
} from "@/lib/mock/products";

function OwnershipBadge({ product }: { product: CatalogProduct }) {
  return <span className="status status--active">{ownershipShort(product.ownership)}</span>;
}

function AppSaleToggle({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onToggle}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 rounded-full transition",
        checked ? "bg-theme-primary" : "bg-slate-300",
      ].join(" ")}
    >
      <span
        className={[
          "mt-[3px] inline-block size-[18px] rounded-full bg-white shadow transition",
          checked ? "ml-[22px]" : "ml-1",
        ].join(" ")}
      />
    </button>
  );
}

function ToggleAppSaleModal({
  product,
  nextListedOnApp,
  onClose,
  onConfirm,
}: {
  product: CatalogProduct;
  nextListedOnApp: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const turningOn = nextListedOnApp;

  return (
    <Modal
      id="toggle-catalog-product-modal"
      show
      title={turningOn ? "Xác nhận bán trên App" : "Xác nhận ẩn sản phẩm"}
      width="md"
      onClose={onClose}
    >
      <form
        className="core_modal__form"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm();
        }}
      >
        <p className="text-sm text-theme-muted">
          {turningOn ? "Bạn có chắc muốn bật bán trên App cho sản phẩm" : "Bạn có chắc muốn ẩn sản phẩm"}{" "}
          <span className="font-semibold text-slate-900">{product.name}</span> (SKU{" "}
          <span className="font-semibold text-slate-900">{product.sku}</span>)
          {turningOn ? "?" : " khỏi App?"}
        </p>
        <div className="core_modal__actions">
          <button type="button" className="core_button core_button--secondary" onClick={onClose}>
            Hủy
          </button>
          <FormSubmitButton>Xác nhận</FormSubmitButton>
        </div>
      </form>
    </Modal>
  );
}

function BomConfigModal({
  product,
  onClose,
  onUpdated,
}: {
  product: CatalogProduct;
  onClose: () => void;
  onUpdated: (bom: BomConfig) => void;
}) {
  const [lines, setLines] = useState<BomLine[]>(product.bom.lines);
  const [wasteRate, setWasteRate] = useState(product.bom.wasteRate);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function updateQuota(index: number, quota: number) {
    setLines((current) =>
      current.map((line, lineIndex) => (lineIndex === index ? { ...line, quota } : line)),
    );
  }

  function confirmUpdate() {
    const payload = {
      sku: product.sku,
      name: product.name,
      wasteRate,
      lines,
    };
    console.log(payload);
    onUpdated({ lines, wasteRate });
    setIsConfirmOpen(false);
    onClose();
  }

  return (
    <>
      <Modal
        id="catalog-bom-modal"
        show
        title="Cấu hình BOM"
        closeable={!isConfirmOpen}
        width="3xl"
        onClose={onClose}
      >
        <form
          className="core_modal__form overflow-hidden -mx-4"
          autoComplete="off"
          onSubmit={(event) => {
            event.preventDefault();
            setIsConfirmOpen(true);
          }}
        >
          <div className="flex-auto space-y-4 overflow-y-auto px-4">
            <div className="rounded-xl border border-theme-primary-border bg-slate-50/80 px-4 py-3">
              <dl className="space-y-2 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-theme-muted">Mã SKU sản phẩm</dt>
                  <dd className="font-medium text-slate-900">{product.sku}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-theme-muted">Tên thành phẩm</dt>
                  <dd className="text-right font-medium text-slate-900">{product.name}</dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-theme-muted">Quyền sở hữu bao</dt>
                  <dd className="font-medium text-slate-900">{ownershipFull(product.ownership)}</dd>
                </div>
              </dl>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-slate-900">
                Bảng công thức tiêu hao vật tư mặc định cho 1 bao xuất xưởng
              </p>
              <div className="overflow-x-auto rounded-xl border border-theme-primary-border">
                <table className="overview-table min-w-[720px]">
                  <colgroup>
                    <col style={{ width: "16%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "32%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "10%" }} />
                    <col style={{ width: "14%" }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <TableHead>Nhóm vật tư</TableHead>
                      <TableHead>Mã vật tư gốc</TableHead>
                      <TableHead>Tên vật tư tiêu hao</TableHead>
                      <TableHead>Định mức</TableHead>
                      <TableHead>ĐVT</TableHead>
                      <TableHead>Chi phí</TableHead>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, index) => (
                      <tr key={`${line.group}-${line.materialCode}`}>
                        <td className="font-medium text-slate-900">
                          {index + 1}. {line.group}
                        </td>
                        <td className="overview-table__code">{line.materialCode}</td>
                        <td>{line.materialName}</td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={line.quota}
                            onChange={(event) =>
                              updateQuota(index, Number(event.target.value) || 0)
                            }
                            className="core_input h-9 w-20 text-right"
                          />
                        </td>
                        <td className="overview-table__muted">{line.unit}</td>
                        <td>
                          <span className="status status--active">
                            {line.chargeable ? "Có tính" : "Không tính"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <Input
              id="bom-waste-rate"
              type="number"
              min={0}
              step={1}
              label="Tỷ lệ hao hụt nguyên liệu cho phép trong quá trình chạy máy đóng gói"
              value={wasteRate}
              onChange={(event) => setWasteRate(Number(event.target.value) || 0)}
            />
          </div>

          <div className="core_modal__actions px-4">
            <button type="button" className="core_button core_button--secondary" onClick={onClose}>
              Hủy
            </button>
            <FormSubmitButton>Cập nhật BOM</FormSubmitButton>
          </div>
        </form>
      </Modal>

      <Modal
        id="catalog-bom-confirm-modal"
        show={isConfirmOpen}
        title="Xác nhận cập nhật BOM"
        width="md"
        className="core_modal--stacked"
        onClose={() => setIsConfirmOpen(false)}
      >
        <form
          className="core_modal__form"
          onSubmit={(event) => {
            event.preventDefault();
            confirmUpdate();
          }}
        >
          <p className="text-sm text-theme-muted">
            Bạn có chắc muốn cập nhật BOM cho sản phẩm{" "}
            <span className="font-semibold text-slate-900">{product.sku}</span>?
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

export function ProductComponent() {
  const [products, setProducts] = useState(MOCK_CATALOG_PRODUCTS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pendingToggle, setPendingToggle] = useState<CatalogProduct | null>(null);
  const [bomProduct, setBomProduct] = useState<CatalogProduct | null>(null);

  useEffect(() => {
    return subscribeHeaderAction("/products/product", (detail) => {
      if (detail.action === "search") {
        setSearch(detail.query ?? "");
        setPage(1);
      }
    });
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((item) =>
      [item.sku, item.name, ownershipShort(item.ownership)].join(" ").toLowerCase().includes(query),
    );
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  function handleToggleSale(product: CatalogProduct) {
    setPendingToggle(product);
  }

  function confirmToggleSale() {
    if (!pendingToggle) return;

    const listedOnApp = !pendingToggle.listedOnApp;
    console.log({
      action: listedOnApp ? "show-product" : "hide-product",
      sku: pendingToggle.sku,
      listedOnApp,
    });
    setProducts((current) =>
      current.map((item) => (item.id === pendingToggle.id ? { ...item, listedOnApp } : item)),
    );
    setPendingToggle(null);
  }

  function updateBom(productId: number, bom: BomConfig) {
    setProducts((current) =>
      current.map((item) => (item.id === productId ? { ...item, bom } : item)),
    );
  }

  return (
    <section className="section" id="product-catalog-section">
      <div className="section-container section-table mb-6 ">
        {filtered.length === 0 ? (
          <EmptyData title="Không có sản phẩm" description="Chưa có sản phẩm nào trong danh mục." />
        ) : (
          <div className="overview-table-wrap">
            <div className="overview-table-inner">
              <table className="overview-table min-w-[1100px]" id="product-catalog-table">
                <colgroup>
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "34%" }} />
                  <col style={{ width: "12%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "12%" }} />
                </colgroup>
                <thead>
                  <tr>
                    <TableHead></TableHead>
                    <TableHead icon="hero-hashtag">Mã SKU sản phẩm tự sinh</TableHead>
                    <TableHead icon="hero-cube">Tên sản phẩm tự định</TableHead>
                    <TableHead>Phân loại</TableHead>
                    <TableHead>BOM</TableHead>
                    <TableHead>Bán trên App</TableHead>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((product, index) => (
                    <tr key={product.id} id={`catalog-product-row-${product.sku}`}>
                      <td className="overview-table__muted">
                        {(page - 1) * pageSize + index + 1}
                      </td>
                      <td className="overview-table__code">{product.sku}</td>
                      <td className="font-medium text-slate-900">{product.name}</td>
                      <td>
                        <OwnershipBadge product={product} />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setBomProduct(product)}
                          className="inline-flex items-center gap-1 rounded-xl border border-theme-primary-border bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <Icon name="hero-plus" className="size-4" />
                          Cấu hình BOM
                        </button>
                      </td>
                      <td>
                        <AppSaleToggle
                          checked={product.listedOnApp}
                          label={`Bán trên App — ${product.sku}`}
                          onToggle={() => handleToggleSale(product)}
                        />
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

      {pendingToggle ? (
        <ToggleAppSaleModal
          product={pendingToggle}
          nextListedOnApp={!pendingToggle.listedOnApp}
          onClose={() => setPendingToggle(null)}
          onConfirm={confirmToggleSale}
        />
      ) : null}

      {bomProduct ? (
        <BomConfigModal
          product={bomProduct}
          onClose={() => setBomProduct(null)}
          onUpdated={(bom) => updateBom(bomProduct.id, bom)}
        />
      ) : null}
    </section>
  );
}
