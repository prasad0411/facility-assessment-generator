/* ───────────────────────────────────────────────────
   ManualInputs — Operational fields not in CMS
   ─────────────────────────────────────────────────── */

import type { ManualInputData } from "../types/facility";

interface Props {
  manual: ManualInputData;
  onChange: (field: keyof ManualInputData, value: string) => void;
  apiName: string;
}

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-xs font-semibold uppercase tracking-wider text-brand-slate"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
      />
    </div>
  );
}

export default function ManualInputs({ manual, onChange, apiName }: Props) {
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-1 text-base font-bold text-brand-navy">
        Operational Details
      </h3>
      <p className="mb-5 text-xs text-brand-muted">
        Fill in internal fields that aren't available in the public CMS database.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Name override */}
        <div className="sm:col-span-2 lg:col-span-3">
          <label
            htmlFor="name-override"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-brand-slate"
          >
            Facility Name Override{" "}
            <span className="font-normal normal-case text-brand-muted">
              (leave blank to use CMS name: {apiName || "—"})
            </span>
          </label>
          <input
            id="name-override"
            type="text"
            value={manual.facilityNameOverride}
            onChange={(e) => onChange("facilityNameOverride", e.target.value)}
            placeholder={apiName}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
          />
        </div>

        <Field
          label="EMR System"
          id="emr"
          value={manual.emr}
          onChange={(v) => onChange("emr", v)}
          placeholder="e.g. PCC, MatrixCare"
        />

        <Field
          label="Current Census"
          id="currentCensus"
          value={manual.currentCensus}
          onChange={(v) => onChange("currentCensus", v)}
          placeholder="e.g. 112"
          type="number"
        />

        <Field
          label="Type of Patient"
          id="typeOfPatient"
          value={manual.typeOfPatient}
          onChange={(v) => onChange("typeOfPatient", v)}
          placeholder="e.g. Long-term & Short-term"
        />

        {/* Previous coverage dropdown */}
        <div>
          <label
            htmlFor="prevCoverage"
            className="mb-1 block text-xs font-semibold uppercase tracking-wider text-brand-slate"
          >
            Previous Coverage from Medelite
          </label>
          <select
            id="prevCoverage"
            value={manual.previousCoverage}
            onChange={(e) => onChange("previousCoverage", e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
          >
            <option value="">Select…</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>

        <Field
          label="Previous Provider Performance"
          id="prevPerformance"
          value={manual.previousPerformance}
          onChange={(v) => onChange("previousPerformance", v)}
          placeholder="e.g. About 30 patients/day"
        />

        <Field
          label="Medical Coverage"
          id="medicalCoverage"
          value={manual.medicalCoverage}
          onChange={(v) => onChange("medicalCoverage", v)}
          placeholder="e.g. Optometry, PCP, Podiatry"
        />
      </div>
    </section>
  );
}
