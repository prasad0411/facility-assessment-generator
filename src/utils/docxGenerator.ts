/* ───────────────────────────────────────────────────
   DOCX Report Generator (Bonus Feature)
   
   Produces an editable Word document matching the
   Facility Assessment Snapshot layout.
   ─────────────────────────────────────────────────── */

import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
  BorderStyle,
  ExternalHyperlink,
  TableLayoutType,
} from "docx";
import { saveAs } from "file-saver";
import type { FacilityAssessment } from "../types/facility";
import { getMedicareCareCompareUrl } from "../api/cmsApi";
import { buildReportRows } from "./dataMapper";

function makeBorderStyle() {
  return {
    top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  };
}

export async function generateDOCX(data: FacilityAssessment): Promise<void> {
  const rows = buildReportRows(data);
  const linkUrl = getMedicareCareCompareUrl(data.cms.ccn);

  // Build table rows
  const tableRows = rows.map(
    (r) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 4200, type: WidthType.DXA },
            borders: makeBorderStyle(),
            children: [
              new Paragraph({
                children: [
                  new TextRun({ text: r.label, bold: true, size: 20, font: "Calibri" }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 5400, type: WidthType.DXA },
            borders: makeBorderStyle(),
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: r.value,
                    italics: true,
                    size: 20,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        ],
      })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 1000, right: 1200, bottom: 1000, left: 1200 },
          },
        },
        children: [
          // ── Branding ──
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [
              new TextRun({
                text: "INFINITE",
                bold: true,
                size: 44,
                font: "Calibri",
                color: "1A2744",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "Managed by MEDELITE",
                size: 18,
                font: "Calibri",
                color: "666666",
              }),
            ],
          }),

          // ── Title ──
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: "FACILITY ASSESSMENT SNAPSHOT",
                bold: true,
                size: 28,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: data.cms.state || "—",
                bold: true,
                size: 24,
                font: "Calibri",
              }),
            ],
          }),

          // ── Data table ──
          new Table({
            layout: TableLayoutType.FIXED,
            width: { size: 9600, type: WidthType.DXA },
            rows: tableRows,
          }),

          // ── Spacer ──
          new Paragraph({ spacing: { before: 400 } }),

          // ── Medicare link ──
          new Paragraph({
            children: [
              new TextRun({
                text: "Source: ",
                size: 16,
                font: "Calibri",
                color: "888888",
              }),
              new ExternalHyperlink({
                link: linkUrl,
                children: [
                  new TextRun({
                    text: "Medicare Care Compare",
                    size: 16,
                    font: "Calibri",
                    color: "0D9488",
                    underline: { type: "single" },
                  }),
                ],
              }),
            ],
          }),

          // ── Footer ──
          new Paragraph({
            spacing: { before: 600 },
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: `Generated on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} — INFINITE platform, Managed by MEDELITE`,
                size: 14,
                font: "Calibri",
                color: "AAAAAA",
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const facilityName =
    data.manual.facilityNameOverride || data.cms.providerName || "Facility";
  const safeName = facilityName
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, "_");
  saveAs(blob, `${safeName}_Assessment.docx`);
}
