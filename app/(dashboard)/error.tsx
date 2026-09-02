"use client";

import { Dashboard } from "@/components/dashboard";
import { PageLoadError } from "@/components/load_error";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Dashboard id="error">
      <PageLoadError message={error.message} onRetry={reset} />
    </Dashboard>
  );
}
