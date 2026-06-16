import type { FacilityAssessment, HospitalizationMetrics } from "../types/facility";

export interface ReportRow {
  label: string;
  value: string;
  group?: "info" | "stars" | "str" | "lt";
}

function fmt(val: number | null, decimals = 2): string {
  if (val == null) return "N/A";
  return parseFloat(val.toFixed(decimals)).toString();
}

function pct(val: number | null): string {
  if (val == null) return "N/A";
  return `${parseFloat(val.toFixed(1))}%`;
}

export function buildReportRows(data: FacilityAssessment): ReportRow[] {
  const { cms, manual, hospitalization: h } = data;
  const displayName = manual.facilityNameOverride || cms.providerName || "—";
  const displayAddress = cms.fullAddress || "—";

  return [
    { label: "Name of Facility", value: displayName, group: "info" },
    { label: "Location", value: displayAddress, group: "info" },
    { label: "EMR", value: manual.emr || "—", group: "info" },
    { label: "Census Capacity", value: cms.certifiedBeds != null ? String(cms.certifiedBeds) : "—", group: "info" },
    { label: "Current Census", value: manual.currentCensus || "—", group: "info" },
    { label: "Type of Patient", value: manual.typeOfPatient || "—", group: "info" },
    { label: "Previous Coverage from Medelite", value: manual.previousCoverage || "—", group: "info" },
    { label: "Previous Provider Performance from Medelite", value: manual.previousPerformance || "—", group: "info" },
    { label: "Medical Coverage", value: manual.medicalCoverage || "—", group: "info" },
    { label: "Overall Star Rating", value: fmt(cms.starRatings.overall, 0), group: "stars" },
    { label: "Health Inspection", value: fmt(cms.starRatings.healthInspection, 0), group: "stars" },
    { label: "Staffing", value: fmt(cms.starRatings.staffing, 0), group: "stars" },
    { label: "Quality of Resident Care", value: fmt(cms.starRatings.qualityOfResidentCare, 0), group: "stars" },
    { label: "Short Term Hospitalization", value: pct(h.strHospitalization), group: "str" },
    { label: "STR National Avg. for Hospitalization", value: pct(h.strHospitalizationNationalAvg), group: "str" },
    { label: "STR State National Avg. for Hospitalization", value: pct(h.strHospitalizationStateAvg), group: "str" },
    { label: "STR ED Visit", value: pct(h.strEdVisit), group: "str" },
    { label: "STR ED Visits National Avg.", value: pct(h.strEdVisitNationalAvg), group: "str" },
    { label: "STR ED Visits State Avg.", value: pct(h.strEdVisitStateAvg), group: "str" },
    { label: "LT Hospitalization", value: fmt(h.ltHospitalization), group: "lt" },
    { label: "LT National Avg. for Hospitalization", value: fmt(h.ltHospitalizationNationalAvg), group: "lt" },
    { label: "LT State National Avg. for Hospitalization", value: fmt(h.ltHospitalizationStateAvg), group: "lt" },
    { label: "ED Visit", value: fmt(h.ltEdVisit), group: "lt" },
    { label: "LT ED Visits National Avg.", value: fmt(h.ltEdVisitNationalAvg), group: "lt" },
    { label: "LT ED Visits State Avg.", value: fmt(h.ltEdVisitStateAvg), group: "lt" },
  ];
}

export function buildCoreRows(data: FacilityAssessment): ReportRow[] {
  return buildReportRows(data).filter(r => r.group === "info" || r.group === "stars");
}

export function analyzeMetrics(h: HospitalizationMetrics) {
  const compare = (facility: number | null, avg: number | null, lowerIsBetter: boolean): "better" | "worse" | "neutral" => {
    if (facility == null || avg == null) return "neutral";
    if (lowerIsBetter) return facility < avg ? "better" : facility > avg ? "worse" : "neutral";
    return facility > avg ? "better" : facility < avg ? "worse" : "neutral";
  };
  return {
    strHospVsNational: compare(h.strHospitalization, h.strHospitalizationNationalAvg, true),
    strHospVsState: compare(h.strHospitalization, h.strHospitalizationStateAvg, true),
    strEdVsNational: compare(h.strEdVisit, h.strEdVisitNationalAvg, true),
    strEdVsState: compare(h.strEdVisit, h.strEdVisitStateAvg, true),
    ltHospVsNational: compare(h.ltHospitalization, h.ltHospitalizationNationalAvg, true),
    ltHospVsState: compare(h.ltHospitalization, h.ltHospitalizationStateAvg, true),
    ltEdVsNational: compare(h.ltEdVisit, h.ltEdVisitNationalAvg, true),
    ltEdVsState: compare(h.ltEdVisit, h.ltEdVisitStateAvg, true),
  };
}
