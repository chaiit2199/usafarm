import type { ApiListMeta } from "@/lib/api/types";

/** Số trang từ meta API (hỗ trợ cả `total_page` và `total`/`total_records`). */
export function totalPagesFromMeta(
  meta: ApiListMeta | undefined,
  itemCount: number,
  fallbackPageSize = 20,
): number {
  if (meta?.total_page != null && meta.total_page > 0) {
    return meta.total_page;
  }

  const total = meta?.total_records ?? meta?.total ?? itemCount;
  const size = meta?.page_size ?? fallbackPageSize;
  return Math.max(1, Math.ceil(total / Math.max(size, 1)));
}
