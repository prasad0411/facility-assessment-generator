/* ───────────────────────────────────────────────────
   Header — INFINITE / Managed by MEDELITE branding
   
   CRITICAL: "INFINITE" is a static brand name and
   must never be replaced by facility data.
   ─────────────────────────────────────────────────── */

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        {/* Heart icon */}
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M20 36S4 26 4 15a8 8 0 0116-1 8 8 0 0116 1c0 11-16 21-16 21z"
            fill="#0d9488"
          />
          <path
            d="M20 36S4 26 4 15a8 8 0 0116-1 8 8 0 0116 1c0 11-16 21-16 21z"
            fill="url(#heartGrad)"
            opacity="0.3"
          />
          <defs>
            <linearGradient id="heartGrad" x1="4" y1="7" x2="36" y2="36">
              <stop stopColor="#5eead4" />
              <stop offset="1" stopColor="#0d9488" />
            </linearGradient>
          </defs>
        </svg>

        <div className="leading-tight">
          <span className="text-2xl font-extrabold tracking-tight text-brand-navy sm:text-3xl">
            INFINITE
          </span>
          <span className="ml-1 block text-[11px] font-medium tracking-widest text-brand-muted sm:inline sm:ml-2">
            Managed by <span className="font-bold text-brand-slate">MED</span>
            <span className="font-bold text-brand-teal">ELITE</span>
          </span>
        </div>
      </div>
    </header>
  );
}
