import type {
  CMSProviderData,
  HospitalizationMetrics,
  StarRatings,
} from "../types/facility";

const BASE = "/cms-api/datastore/query";

const DATASETS = {
  providerInfo: "4pq5-n9py",
  claimsQuality: "ijh5-nb2v",
  stateAverages: "xcdc-v8bm",
} as const;

interface Condition {
  property: string;
  value: string;
  operator?: string;
}

function buildQueryUrl(datasetId: string, conditions: Condition[], limit?: number): string {
  const params = new URLSearchParams();
  conditions.forEach((c, i) => {
    params.set(`conditions[${i}][property]`, c.property);
    params.set(`conditions[${i}][value]`, c.value);
    params.set(`conditions[${i}][operator]`, c.operator ?? "=");
  });
  if (limit) params.set("limit", String(limit));
  return `${BASE}/${datasetId}/0?${params.toString()}`;
}

async function query(datasetId: string, conditions: Condition[], limit?: number): Promise<Record<string, string>[]> {
  const url = buildQueryUrl(datasetId, conditions, limit);
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`CMS API error (${res.status}): ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  return data.results ?? data;
}

function num(val: string | undefined | null): number | null {
  if (val == null || val === "" || val === "N/A" || val === "Not Available") return null;
  const n = parseFloat(val);
  return isNaN(n) ? null : n;
}

function str(val: string | undefined | null): string {
  return val?.trim() ?? "";
}

function get(row: Record<string, string>, key: string): string {
  if (key in row) return row[key];
  const lower = key.toLowerCase();
  for (const k of Object.keys(row)) {
    if (k.toLowerCase() === lower) return row[k];
  }
  return "";
}

/**
 * Find a column whose name contains ALL of the given keywords.
 * CMS truncates long column names with hash suffixes, so we
 * match on multiple short fragments instead of one long string.
 */
function findCol(row: Record<string, string>, ...keywords: string[]): string {
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  for (const k of Object.keys(row)) {
    const lower = k.toLowerCase();
    if (lowerKeywords.every(kw => lower.includes(kw))) return row[k];
  }
  return "";
}

export async function fetchProviderInfo(ccn: string): Promise<CMSProviderData> {
  const rows = await query(
    DATASETS.providerInfo,
    [{ property: "cms_certification_number_ccn", value: ccn }],
    1
  );
  if (!rows || rows.length === 0) {
    throw new Error(`No facility found for CCN "${ccn}". Verify the number and try again.`);
  }
  const r = rows[0];
  const starRatings: StarRatings = {
    overall: num(get(r, "overall_rating")),
    healthInspection: num(get(r, "health_inspection_rating")),
    staffing: num(get(r, "staffing_rating")),
    qualityOfResidentCare: num(get(r, "qm_rating")),
  };
  const address = str(get(r, "provider_address"));
  const city = str(get(r, "citytown"));
  const state = str(get(r, "state"));
  const zip = str(get(r, "zip_code"));
  return {
    ccn,
    providerName: str(get(r, "provider_name")),
    address, city, state, zip,
    fullAddress: [address, city, state, zip].filter(Boolean).join(", "),
    certifiedBeds: num(get(r, "number_of_certified_beds")),
    averageResidentsPerDay: num(get(r, "average_number_of_residents_per_day")),
    providerType: str(get(r, "provider_type")),
    ownershipType: str(get(r, "ownership_type")),
    starRatings,
  };
}

export async function fetchHospitalizationMetrics(ccn: string, facilityState: string): Promise<HospitalizationMetrics> {
  const claimsRows = await query(DATASETS.claimsQuality, [{ property: "cms_certification_number_ccn", value: ccn }]);
  const measureMap: Record<string, Record<string, string>> = {};
  for (const row of claimsRows) {
    const code = str(get(row, "measure_code"));
    measureMap[code] = row;
  }
  const [stateRows, nationalRows] = await Promise.all([
    query(DATASETS.stateAverages, [{ property: "state_or_nation", value: facilityState }], 1),
    query(DATASETS.stateAverages, [{ property: "state_or_nation", value: "NATION" }], 1),
  ]);
  const stateAvg = stateRows[0] ?? {};
  const nationalAvg = nationalRows[0] ?? {};

  // Log column names to debug (remove later)

  const getScore = (code: string): number | null => {
    const row = measureMap[code];
    if (!row) return null;
    return num(get(row, "adjusted_score")) ?? num(get(row, "observed_score"));
  };

  // Use short keyword fragments to handle CMS column name truncation
  return {
    strHospitalization: getScore("521"),
    strHospitalizationNationalAvg: num(findCol(nationalAvg, "short_stay", "rehospitalized")),
    strHospitalizationStateAvg: num(findCol(stateAvg, "short_stay", "rehospitalized")),
    strEdVisit: getScore("522"),
    strEdVisitNationalAvg: num(findCol(nationalAvg, "short_stay", "outpatient")),
    strEdVisitStateAvg: num(findCol(stateAvg, "short_stay", "outpatient")),
    ltHospitalization: getScore("551"),
    ltHospitalizationNationalAvg: num(findCol(nationalAvg, "per_1000", "hospitalization")),
    ltHospitalizationStateAvg: num(findCol(stateAvg, "per_1000", "hospitalization")),
    ltEdVisit: getScore("552"),
    ltEdVisitNationalAvg: num(findCol(nationalAvg, "per_1000", "emergency")),
    ltEdVisitStateAvg: num(findCol(stateAvg, "per_1000", "emergency")),
  };
}

export function getMedicareCareCompareUrl(ccn: string): string {
  return `https://www.medicare.gov/care-compare/details/nursing-home/${ccn}`;
}
