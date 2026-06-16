# INFINITE — Facility Assessment Report Generator

**Medelite Technical Case Study Submission**

A lightweight web application that allows Medelite directors to instantly look up any skilled nursing facility by its CMS Certification Number (CCN), combine public CMS data with internal operational notes, and download a polished Facility Assessment Snapshot as a PDF or editable Word document.

![Tech Stack](https://img.shields.io/badge/React_18-TypeScript-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

---

## Live Demo

🔗 **[https://facility-assessment-generator.vercel.app](https://facility-assessment-generator.vercel.app)**

**Test CCN:** `686123` (Kendall Lakes Healthcare and Rehab Center, Miami, FL)

---

## Features

### Core MVP (All Implemented)

| Requirement | Status |
|---|---|
| Dynamic CCN lookup with validation | ✅ |
| CMS Provider Data Catalog API integration | ✅ |
| Facility name override (custom text replaces API name) | ✅ |
| Manual operational inputs (EMR, Census, Patient Type, Medelite History) | ✅ |
| One-click PDF download (clean, print-ready) | ✅ |
| Clickable Medicare Care Compare hyperlink in PDF | ✅ |
| "INFINITE — Managed by MEDELITE" branding (static, never overwritten) | ✅ |
| Live deployed URL + public repo | ✅ |

### Bonus Features (All Implemented)

| Feature | Status |
|---|---|
| All 12 hospitalization/ED metrics (STR + LT with state & national averages) | ✅ |
| Word document (.docx) export | ✅ |
| Interactive bar charts comparing facility vs. national vs. state metrics | ✅ |
| Advanced error handling (validation, API failures, error boundary, graceful degradation) | ✅ |

---

## Architecture

```
src/
├── api/
│   └── cmsApi.ts           # CMS Provider Data Catalog API service
├── components/
│   ├── Header.tsx           # INFINITE / MEDELITE branding
│   ├── CCNSearch.tsx         # CCN input with validation
│   ├── ManualInputs.tsx      # Operational fields form
│   ├── FacilityReport.tsx    # Full data display
│   ├── StarRating.tsx        # Visual 1–5 star cards
│   ├── MetricsChart.tsx      # Recharts bar charts (bonus)
│   └── ErrorBoundary.tsx     # React error boundary (bonus)
├── utils/
│   ├── pdfGenerator.ts       # jsPDF report builder
│   ├── docxGenerator.ts      # docx Word builder (bonus)
│   └── dataMapper.ts         # CMS → report field mapper
├── types/
│   └── facility.ts           # TypeScript interfaces
├── App.tsx                    # Main application shell
├── main.tsx                   # Entry point
└── index.css                  # Tailwind + global styles
```

### Data Flow

```
User enters CCN
       │
       ▼
┌──────────────────────────────────┐
│  CMS Provider Data Catalog API   │
│  (data.cms.gov DKAN endpoint)    │
└──────────┬───────────────────────┘
           │
     ┌─────┴──────┐
     │             │
     ▼             ▼
Provider Info   Claims QMs + State Averages
(star ratings,  (12 hospitalization/ED metrics
 beds, address)  with national & state benchmarks)
     │             │
     └─────┬───────┘
           │
           ▼
  dataMapper.ts builds report rows
           │
     ┌─────┴──────┐
     │             │
     ▼             ▼
  pdfGenerator   docxGenerator
  (jsPDF +        (docx npm
   AutoTable)      package)
     │             │
     ▼             ▼
  .pdf download  .docx download
```

### API Integration Strategy

The CMS Provider Data Catalog uses the DKAN platform. Distribution UUIDs (which serve as table identifiers) change with each monthly data refresh. This app handles that dynamically:

1. **Metadata resolution:** On first query, the app calls the metastore endpoint to discover the current distribution UUID for each dataset.
2. **SQL query:** Uses the resolved UUID in a `SELECT` query via the datastore SQL endpoint.
3. **Caching:** Distribution UUIDs are cached in memory for the session to avoid redundant metadata lookups.
4. **Graceful degradation:** If claims-based data fails to load, the core MVP (provider info + star ratings) still displays and exports correctly.

**Datasets queried:**

| Dataset | ID | Data |
|---|---|---|
| Provider Information | `4pq5-n9py` | Location, beds, star ratings |
| Claims Quality Measures | `ijh5-nb2v` | Hospitalization/ED facility rates |
| State & US Averages | `xcdc-v8bm` | National and state benchmarks |

### CMS Field Mapping

| Report Label | CMS Column | Source |
|---|---|---|
| Name of Facility | `Provider Name` | API (with manual override) |
| Location | `Provider Address` + `City/Town` + `State` + `ZIP Code` | API |
| Census Capacity | `Number of Certified Beds` | API |
| Overall Star Rating | `Overall Rating` | API |
| Health Inspection | `Health Inspection Rating` | API |
| Staffing | `Staffing Rating` | API |
| Quality of Resident Care | `QM Rating` | API |
| STR metrics | Claims measure codes `521`, `522` | API |
| LT metrics | Claims measure codes `551`, `552` | API |
| Averages | State US Averages file (by state code + "NATION") | API |

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | React 18 + TypeScript | Type safety, component model |
| Build | Vite 6 | Fast HMR, optimal production builds |
| Styling | Tailwind CSS 3.4 | Utility-first, no CSS-in-JS overhead |
| PDF Export | jsPDF + jsPDF-AutoTable | Client-side PDF generation |
| DOCX Export | docx (npm) + file-saver | Client-side Word generation |
| Charts | Recharts | Declarative React charting |
| Icons | Lucide React + inline SVG | Lightweight, tree-shakeable |
| Deployment | Vercel | Zero-config, global CDN |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm 9+

### Install & Run

```bash
# Clone the repository
git clone https://github.com/<your-username>/facility-assessment-generator.git
cd facility-assessment-generator

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI (if needed)
npm i -g vercel

# Deploy
vercel
```

Or connect the GitHub repo to [vercel.com](https://vercel.com) for automatic deployments on push.

---

## Test Verification

Use **CCN `686123`** to verify against the reference data for **Kendall Lakes Healthcare and Rehab Center**:

| Field | Expected Value |
|---|---|
| Name | Kendall Lakes Healthcare and Rehab Center |
| Location | 5280 SW 157th Ave, Miami, FL |
| Census Capacity | 120 |
| Overall Star Rating | 1 |
| Health Inspection | 1 |
| Staffing | 2 |
| Quality of Resident Care | 4 |
| STR Hospitalization | 18.7% |
| LT Hospitalization | 1.86 |
| Medicare Link | https://www.medicare.gov/care-compare/details/nursing-home/686123 |

---

## Engineering Assumptions

1. **CORS:** The CMS data.cms.gov API supports cross-origin requests from browser clients. If any endpoint introduces CORS restrictions in the future, a thin proxy (Vercel serverless function or similar) can be added without changing the frontend code.

2. **Distribution UUID resolution:** CMS updates dataset distributions monthly. The app resolves UUIDs dynamically via the metastore, so it always queries the latest data without hardcoded identifiers.

3. **Claims data availability:** Some facilities (especially newly certified ones) may not have claims-based quality measures. The app degrades gracefully — the core report generates with star ratings and manual inputs, while showing a non-blocking warning about unavailable claims data.

4. **Column header matching:** CMS API responses use the full column headers from the data dictionary. The app performs case-insensitive matching to handle minor formatting variations across API versions.

5. **Branding guardrail:** The "INFINITE" brand text in the header and exports is hardcoded and never programmatically replaced by facility data, per the case study requirements.

---

## License

Built for the Medelite Technical Case Study.
