/* ───────────────────────────────────────────────────
   Type definitions for the Facility Assessment Report
   ─────────────────────────────────────────────────── */

/** Star-rating fields pulled from CMS Provider Info */
export interface StarRatings {
  overall: number | null;
  healthInspection: number | null;
  staffing: number | null;
  qualityOfResidentCare: number | null;
}

/** Claims-based hospitalization / ED visit metrics */
export interface HospitalizationMetrics {
  strHospitalization: number | null;
  strHospitalizationNationalAvg: number | null;
  strHospitalizationStateAvg: number | null;
  strEdVisit: number | null;
  strEdVisitNationalAvg: number | null;
  strEdVisitStateAvg: number | null;
  ltHospitalization: number | null;
  ltHospitalizationNationalAvg: number | null;
  ltHospitalizationStateAvg: number | null;
  ltEdVisit: number | null;
  ltEdVisitNationalAvg: number | null;
  ltEdVisitStateAvg: number | null;
}

/** Provider-level data returned by CMS API */
export interface CMSProviderData {
  ccn: string;
  providerName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  fullAddress: string;
  certifiedBeds: number | null;
  averageResidentsPerDay: number | null;
  providerType: string;
  ownershipType: string;
  starRatings: StarRatings;
}

/** Manual operational inputs entered by the user */
export interface ManualInputData {
  facilityNameOverride: string;
  emr: string;
  currentCensus: string;
  typeOfPatient: string;
  previousCoverage: "Yes" | "No" | "";
  previousPerformance: string;
  medicalCoverage: string;
}

/** Complete facility assessment data */
export interface FacilityAssessment {
  cms: CMSProviderData;
  manual: ManualInputData;
  hospitalization: HospitalizationMetrics;
}

/** CMS API fetch status */
export type FetchStatus = "idle" | "loading" | "success" | "error";
