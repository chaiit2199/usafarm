"use client";

const DEFAULT_PAGE_SIZES = [10, 20, 50, 100];

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
};

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZES,
  onPageChange,
  onPageSizeChange,
  className,
}: PaginationProps) {
  const pages = Math.max(totalPages, 1);
  const page = Math.min(Math.max(currentPage, 1), pages);
  const isFirst = page <= 1;
  const isLast = page >= pages;

  function goTo(next: number) {
    if (next < 1 || next > pages || next === page) return;
    onPageChange(next);
  }

  return (
    <div className={["core_paginator", className].filter(Boolean).join(" ")}>
      {onPageSizeChange && pageSize != null && (
        <label className="core_paginator__size">
          <span>Hiển thị:</span>
          <select
            className="core_paginator__select"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      )}

      <nav className="core_paginator__nav" aria-label="Phân trang">
        <button
          type="button"
          className="core_paginator__btn"
          disabled={isFirst}
          onClick={() => goTo(page - 1)}
        >
          ← Trang trước
        </button>
        <span className="core_paginator__page" aria-current="page">
          {page}
        </span>
        <button
          type="button"
          className="core_paginator__btn"
          disabled={isLast}
          onClick={() => goTo(page + 1)}
        >
          Trang sau →
        </button>
      </nav>
    </div>
  );
}
