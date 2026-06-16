/* ───────────────────────────────────────────────────
   CCNSearch — CMS Certification Number input
   ─────────────────────────────────────────────────── */

import { useState, type FormEvent } from "react";

interface Props {
  onSearch: (ccn: string) => void;
  isLoading: boolean;
}

export default function CCNSearch({ onSearch, isLoading }: Props) {
  const [ccn, setCcn] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = ccn.trim();

    // CCN validation: 6 alphanumeric characters
    if (!trimmed) {
      setValidationError("Please enter a CCN.");
      return;
    }
    if (!/^[A-Za-z0-9]{6}$/.test(trimmed)) {
      setValidationError(
        "A valid CCN is exactly 6 alphanumeric characters (e.g., 686123)."
      );
      return;
    }

    setValidationError("");
    onSearch(trimmed);
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-lg font-bold text-brand-navy">
        Facility Assessment Snapshot
      </h2>
      <p className="mb-4 text-sm text-brand-muted">
        Enter a CMS Certification Number to pull public data from Medicare Care
        Compare.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="ccn-input"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-brand-slate"
          >
            CCN (CMS Certification Number)
          </label>
          <input
            id="ccn-input"
            type="text"
            value={ccn}
            onChange={(e) => {
              setCcn(e.target.value);
              if (validationError) setValidationError("");
            }}
            placeholder="e.g. 686123"
            maxLength={6}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 font-mono text-base tracking-wider placeholder:text-slate-400 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
            disabled={isLoading}
            autoFocus
          />
          {validationError && (
            <p className="mt-1 text-xs text-red-600">{validationError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-teal px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Fetching…
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Look Up
            </>
          )}
        </button>
      </form>
    </section>
  );
}
