import type { ReactNode } from "react";

export function StatusBanner({
  tone,
  children,
}: {
  tone: "info" | "error";
  children: ReactNode;
}) {
  const className =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm ${className}`}>
      {children}
    </div>
  );
}
