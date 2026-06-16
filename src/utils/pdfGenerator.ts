import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { FacilityAssessment } from "../types/facility";
import { getMedicareCareCompareUrl } from "../api/cmsApi";
import { buildReportRows } from "./dataMapper";

export function generatePDF(data: FacilityAssessment): void {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = 20;

  // ── Heart icon ──
  const cx = pageW / 2 - 32;
  doc.setFillColor(13, 148, 136);
  doc.circle(cx - 3.5, y + 2, 4.5, "F");
  doc.circle(cx + 3.5, y + 2, 4.5, "F");
  doc.triangle(cx - 8, y + 4, cx + 8, y + 4, cx, y + 14, "F");

  // ── Brand text ──
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(26, 39, 68);
  doc.text("INFINITE", cx + 14, y + 8);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Managed by MEDELITE", cx + 14, y + 13);

  y += 24;

  // ── Title ──
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 39, 68);
  doc.text("FACILITY ASSESSMENT SNAPSHOT", pageW / 2, y, { align: "center" });
  y += 7;

  doc.setFontSize(12);
  doc.text(data.cms.state || "—", pageW / 2, y, { align: "center" });
  y += 8;

  // ── Data table ──
  const rows = buildReportRows(data);

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    body: rows.map((r) => [r.label, r.value]),
    theme: "grid",
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: [200, 200, 200],
      lineWidth: 0.3,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 82, halign: "left" },
      1: { fontStyle: "italic", halign: "left" },
    },
    didParseCell(hookData) {
      if (hookData.row.index % 2 === 0) {
        hookData.cell.styles.fillColor = [248, 250, 252];
      }
    },
  });

  // ── Medicare link ──
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable?.finalY ?? 250;
  const linkY = finalY + 8;
  const linkUrl = getMedicareCareCompareUrl(data.cms.ccn);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Source: Medicare Care Compare", margin, linkY);

  doc.setTextColor(13, 148, 136);
  doc.textWithLink(linkUrl, margin, linkY + 4, { url: linkUrl });

  // ── Footer ──
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(
    "Generated on " + new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) + " — INFINITE platform, Managed by MEDELITE",
    pageW / 2, pageH - 10, { align: "center" }
  );

  // ── Download ──
  const facilityName = data.manual.facilityNameOverride || data.cms.providerName || "Facility";
  const safeName = facilityName.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");
  doc.save(safeName + "_Assessment.pdf");
}
