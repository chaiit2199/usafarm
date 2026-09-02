import { unstable_rethrow } from "next/navigation";

import { PageLoadError } from "@/components/load_error";

export function catchPageLoadError(error: unknown) {
  unstable_rethrow(error);
  return (
    <PageLoadError message={error instanceof Error ? error.message : "Không tải được dữ liệu"} />
  );
}
