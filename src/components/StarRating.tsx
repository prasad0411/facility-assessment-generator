/* ───────────────────────────────────────────────────
   StarRating — Visual star display (1–5)
   ─────────────────────────────────────────────────── */

interface Props {
  label: string;
  rating: number | null;
}

export default function StarRating({ label, rating }: Props) {
  const stars = rating ?? 0;

  // Color coding: 1–2 = red, 3 = amber, 4–5 = green
  const color =
    stars <= 2
      ? "text-red-500"
      : stars === 3
        ? "text-amber-500"
        : "text-emerald-500";

  const bgColor =
    stars <= 2
      ? "bg-red-50 border-red-200"
      : stars === 3
        ? "bg-amber-50 border-amber-200"
        : "bg-emerald-50 border-emerald-200";

  return (
    <div
      className={`flex flex-col items-center rounded-lg border p-3 ${bgColor}`}
    >
      <span className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-brand-slate">
        {label}
      </span>

      {rating != null ? (
        <>
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 ${i <= stars ? color : "text-slate-200"}`}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className={`mt-1 text-lg font-bold ${color}`}>{stars}/5</span>
        </>
      ) : (
        <span className="text-sm text-brand-muted">N/A</span>
      )}
    </div>
  );
}
