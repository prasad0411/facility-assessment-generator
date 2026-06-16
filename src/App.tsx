/* ───────────────────────────────────────────────────
   App.tsx — Main application shell
   ─────────────────────────────────────────────────── */

import { useState, useCallback } from "react";
import Header from "./components/Header";
import CCNSearch from "./components/CCNSearch";
import ManualInputs from "./components/ManualInputs";
import FacilityReport from "./components/FacilityReport";
import ErrorBoundary from "./components/ErrorBoundary";
import type {
  CMSProviderData,
  HospitalizationMetrics,
  ManualInputData,
  FacilityAssessment,
  FetchStatus,
} from "./types/facility";
import {
  fetchProviderInfo,
  fetchHospitalizationMetrics,
} from "./api/cmsApi";
import { generatePDF } from "./utils/pdfGenerator";
import { generateDOCX } from "./utils/docxGenerator";

const EMPTY_MANUAL: ManualInputData = {
  facilityNameOverride: "",
  emr: "",
  currentCensus: "",
  typeOfPatient: "",
  previousCoverage: "",
  previousPerformance: "",
  medicalCoverage: "",
};

const EMPTY_HOSPITALIZATION: HospitalizationMetrics = {
  strHospitalization: null,
  strHospitalizationNationalAvg: null,
  strHospitalizationStateAvg: null,
  strEdVisit: null,
  strEdVisitNationalAvg: null,
  strEdVisitStateAvg: null,
  ltHospitalization: null,
  ltHospitalizationNationalAvg: null,
  ltHospitalizationStateAvg: null,
  ltEdVisit: null,
  ltEdVisitNationalAvg: null,
  ltEdVisitStateAvg: null,
};

export default function App() {
  // ── State ──
  const [cmsData, setCmsData] = useState<CMSProviderData | null>(null);
  const [hospitalization, setHospitalization] =
    useState<HospitalizationMetrics>(EMPTY_HOSPITALIZATION);
  const [manual, setManual] = useState<ManualInputData>(EMPTY_MANUAL);
  const [status, setStatus] = useState<FetchStatus>("idle");
  const [hospStatus, setHospStatus] = useState<FetchStatus>("idle");
  const [error, setError] = useState<string>("");

  // ── Handlers ──
  const handleSearch = useCallback(async (ccn: string) => {
    setStatus("loading");
    setHospStatus("loading");
    setError("");
    setCmsData(null);
    setHospitalization(EMPTY_HOSPITALIZATION);

    try {
      const provider = await fetchProviderInfo(ccn);
      setCmsData(provider);
      setStatus("success");

      // Kick off hospitalization metrics in parallel (bonus)
      try {
        const hospData = await fetchHospitalizationMetrics(
          ccn,
          provider.state
        );
        setHospitalization(hospData);
        setHospStatus("success");
      } catch (e) {
        console.warn("Claims data unavailable:", e);
        setHospStatus("error");
        // Non-blocking: MVP still works without claims data
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "An unexpected error occurred.";
      setError(msg);
      setStatus("error");
      setHospStatus("idle");
    }
  }, []);

  const handleManualChange = useCallback(
    (field: keyof ManualInputData, value: string) => {
      setManual((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const buildAssessment = (): FacilityAssessment | null => {
    if (!cmsData) return null;
    return { cms: cmsData, manual, hospitalization };
  };

  const handleDownloadPDF = () => {
    const assessment = buildAssessment();
    if (!assessment) return;
    generatePDF(assessment);
  };

  const handleDownloadDOCX = async () => {
    const assessment = buildAssessment();
    if (!assessment) return;
    await generateDOCX(assessment);
  };

  // ── Render ──
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-brand-bg">
        <Header />

        <main className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
          {/* CCN Search */}
          <CCNSearch onSearch={handleSearch} isLoading={status === "loading"} />

          {/* Error display */}
          {status === "error" && error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <span className="font-semibold">Lookup failed: </span>
              {error}
            </div>
          )}

          {/* Data loaded → show manual inputs + report */}
          {cmsData && status === "success" && (
            <>
              <ManualInputs
                manual={manual}
                onChange={handleManualChange}
                apiName={cmsData.providerName}
              />

              <FacilityReport
                cms={cmsData}
                manual={manual}
                hospitalization={hospitalization}
                hospStatus={hospStatus}
              />

              {/* Export buttons */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-navy px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-opacity-90 active:scale-[0.98]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Download PDF
                </button>

                <button
                  onClick={handleDownloadDOCX}
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-brand-navy px-6 py-3 text-sm font-semibold text-brand-navy shadow-sm transition hover:bg-brand-navy hover:text-white active:scale-[0.98]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Download Word (.docx)
                </button>
              </div>
            </>
          )}

          {/* Idle state */}
          {status === "idle" && (
            <div className="mt-16 text-center text-brand-muted">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-4 h-16 w-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
              <p className="text-lg font-medium">Enter a CCN above to get started</p>
              <p className="mt-1 text-sm">
                Try <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-brand-teal">686123</code> for Kendall Lakes Healthcare and Rehab Center
              </p>
            </div>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
