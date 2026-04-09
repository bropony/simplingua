"use client";

import ErrorMessage from "@/components/ErrorMessage";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorMessage message="管理后台加载失败" onRetry={reset} />;
}
