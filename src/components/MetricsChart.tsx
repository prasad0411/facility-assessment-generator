/* ───────────────────────────────────────────────────
   MetricsChart — Hospitalization / ED comparative
   bar charts using Recharts (Bonus Feature)
   ─────────────────────────────────────────────────── */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { HospitalizationMetrics } from "../types/facility";

interface Props {
  data: HospitalizationMetrics;
  state: string;
}

export default function MetricsChart({ data, state }: Props) {
  const strData = [
    {
      name: "Hospitalization",
      Facility: data.strHospitalization,
      National: data.strHospitalizationNationalAvg,
      [`${state} State`]: data.strHospitalizationStateAvg,
    },
    {
      name: "ED Visits",
      Facility: data.strEdVisit,
      National: data.strEdVisitNationalAvg,
      [`${state} State`]: data.strEdVisitStateAvg,
    },
  ];

  const ltData = [
    {
      name: "Hospitalization",
      Facility: data.ltHospitalization,
      National: data.ltHospitalizationNationalAvg,
      [`${state} State`]: data.ltHospitalizationStateAvg,
    },
    {
      name: "ED Visits",
      Facility: data.ltEdVisit,
      National: data.ltEdVisitNationalAvg,
      [`${state} State`]: data.ltEdVisitStateAvg,
    },
  ];

  const hasStrData = strData.some((d) => d.Facility != null);
  const hasLtData = ltData.some((d) => d.Facility != null);

  if (!hasStrData && !hasLtData) return null;

  const stateKey = `${state} State`;

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      {hasStrData && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="mb-3 text-sm font-bold text-brand-navy">
            Short-Term Metrics (%)
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={strData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
                formatter={(v: number) => `${v}%`}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Facility" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="National" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey={stateKey} fill="#cbd5e1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {hasLtData && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h4 className="mb-3 text-sm font-bold text-brand-navy">
            Long-Term Metrics (per 1,000 days)
          </h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={ltData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Facility" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="National" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey={stateKey} fill="#cbd5e1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
