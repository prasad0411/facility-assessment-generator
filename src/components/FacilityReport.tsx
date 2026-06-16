import type {
  CMSProviderData,
  ManualInputData,
  HospitalizationMetrics,
  FetchStatus,
} from "../types/facility";
import { getMedicareCareCompareUrl } from "../api/cmsApi";
import StarRating from "./StarRating";
import MetricsChart from "./MetricsChart";
import { buildReportRows } from "../utils/dataMapper";

interface Props {
  cms: CMSProviderData;
  manual: ManualInputData;
  hospitalization: HospitalizationMetrics;
  hospStatus: FetchStatus;
}

export default function FacilityReport({ cms, manual, hospitalization, hospStatus }: Props) {
  const displayName = manual.facilityNameOverride || cms.providerName;
  const careCompareUrl = getMedicareCareCompareUrl(cms.ccn);
  const assessment = { cms, manual, hospitalization };
  const allRows = buildReportRows(assessment);
  const infoRows = allRows.filter((r) => r.group === "info");
  const starRows = allRows.filter((r) => r.group === "stars");
  const hospRows = allRows.filter((r) => r.group === "str" || r.group === "lt");

  const ExtLinkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );

  const Spinner = () => (
    <svg className="h-4 w-4 animate-spin text-brand-teal" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );

  const DataTable = ({ title, rows: tableRows }: { title: string; rows: typeof infoRows }) => (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
        <h4 className="text-sm font-bold text-brand-navy">{title}</h4>
      </div>
      <table className="w-full text-sm">
        <tbody>
          {tableRows.map((row, i) => (
            <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/60"}>
              <td className="w-2/5 border-b border-slate-100 px-5 py-2.5 font-semibold text-brand-slate">{row.label}</td>
              <td className="border-b border-slate-100 px-5 py-2.5 italic text-brand-slate">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <section className="mt-6 space-y-6">
      <div className="text-center">
        <h2 className="text-lg font-bold tracking-wide text-brand-navy">FACILITY ASSESSMENT SNAPSHOT</h2>
        <span className="mt-1 inline-block rounded bg-brand-navy px-3 py-0.5 text-sm font-bold tracking-wider text-white">
          {cms.state || "—"}
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-brand-navy">{displayName}</h3>
            <p className="mt-0.5 text-sm text-brand-muted">{cms.fullAddress}</p>
            <p className="mt-0.5 text-xs text-brand-muted">
              CCN: <span className="font-mono">{cms.ccn}</span>
              {cms.ownershipType && <> · {cms.ownershipType}</>}
            </p>
          </div>
          <a href={careCompareUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-brand-teal hover:underline">
            View on Medicare.gov <ExtLinkIcon />
          </a>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StarRating label="Overall" rating={cms.starRatings.overall} />
          <StarRating label="Health Inspection" rating={cms.starRatings.healthInspection} />
          <StarRating label="Staffing" rating={cms.starRatings.staffing} />
          <StarRating label="Quality of Care" rating={cms.starRatings.qualityOfResidentCare} />
        </div>
      </div>

      <DataTable title="Facility Information" rows={infoRows} />
      <DataTable title="CMS Star Ratings" rows={starRows} />

      {hospStatus === "loading" && (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <Spinner />
          <span className="text-sm text-brand-muted">Loading claims-based metrics…</span>
        </div>
      )}

      {hospStatus === "error" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Claims-based hospitalization and ED metrics could not be loaded. The core report data is still available above.
        </div>
      )}

      {hospStatus === "success" && hospRows.length > 0 && (
        <>
          <DataTable title="Hospitalization & ED Visit Metrics" rows={hospRows} />
          <MetricsChart data={hospitalization} state={cms.state} />
        </>
      )}
    </section>
  );
}
