"use client";

/**
 * Inline form error box.
 *
 * Renders the API error envelope the safe way: a server-authored `message`
 * plus flattened `errors`. Never renders raw exception text or stack
 * traces (Phase 2 — no internal detail leaks to the user).
 */
export function FormError({
  message,
  errors,
}: {
  message?: string;
  errors?: Record<string, string[]> | string[] | null;
}) {
  const items = errors
    ? Array.isArray(errors)
      ? errors.filter((e): e is string => typeof e === "string")
      : Object.values(errors).flat().filter(Boolean)
    : [];

  if (!message && items.length === 0) return null;

  return (
    <div
      role="alert"
      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
    >
      {message && <p className="font-medium">{message}</p>}
      {items.length > 0 && (
        <ul className="mt-1 list-disc space-y-0.5 pl-4">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}