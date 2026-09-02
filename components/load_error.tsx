"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { EmptyData } from "@/components/empty_data";
import type { IconName } from "@/components/icon";

function errorCopy(message?: string): {
  title: string;
  description: string;
  icon: IconName;
} {
  const text = message?.trim() ?? "";
  const isForbidden = /không có quyền|AUTH_FORBIDDEN/i.test(text);

  if (isForbidden) {
    return {
      title: "Không có quyền truy cập",
      description: text || "Bạn không được thực hiện thao tác này.",
      icon: "hero-lock-closed",
    };
  }

  const isGeneric =
    !text ||
    /server components render|digest|http request failed|minified react error|#441/i.test(text);

  return {
    title: "Không tải được dữ liệu",
    description: isGeneric
      ? "Đã xảy ra lỗi khi tải trang. Thử lại hoặc quay về trang chủ."
      : text,
    icon: "hero-exclamation-circle-mini",
  };
}

export function LoadError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const router = useRouter();
  const copy = errorCopy(message);
  const retry = onRetry ?? (() => router.refresh());

  return (
    <EmptyData title={copy.title} description={copy.description} icon={copy.icon}>
      <div className="mt-4 flex items-center justify-center gap-2">
        <button type="button" className="core_button core_button--primary" onClick={retry}>
          Thử lại
        </button>
        <Link href="/" className="core_button core_button--secondary">
          Về trang chủ
        </Link>
      </div>
    </EmptyData>
  );
}

export function PageLoadError({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <section className="section">
      <div className="section-table">
        <LoadError message={message} onRetry={onRetry} />
      </div>
    </section>
  );
}
