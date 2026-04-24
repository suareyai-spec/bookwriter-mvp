# KOSIQ — The Operating System for Value-Based Care

**AI-powered healthcare platform for managed care organizations, ACOs, and health plans.**

Live: [https://kosiq.ai](https://kosiq.ai)

---

## Overview

KOSIQ is a multi-product healthcare analytics platform that helps managed care organizations improve patient outcomes, reduce costs, and maximize quality performance. Built with AI-native architecture including predictive and prescriptive analytics.

## Products (11)

| Product | Description | Accent Color |
|---------|-------------|-------------|
| **AtlasIQ** | Population Health Intelligence — demographics, health tiers, disease prevalence, SDOH, provider panels | Blue `#26acf7` |
| **ClinIQ** | AI Clinical Decision Trees — conversational AI analysis, 1,055+ discrete metrics, custom tree builder | Purple `#8B5CF6` |
| **Risk Engine** | HCC Risk Adjustment + ARC (Adaptive Risk Classification) — coding gaps, RAF scores, morbidity tiers | Amber `#F59E0B` |
| **Quality** | HEDIS measures, PCMH recognition, quality dashboards, gap-in-care tracking, provider scorecards | Emerald `#10B981` |
| **Care Management** | CCM, PCM, APCM, TCM, Care Plans — enrollment, time tracking, discharge follow-up | Pink `#EC4899` |
| **RPM** | Remote Patient Monitoring — device management, vitals trending, alerts, clinical work queue | Cyan `#06B6D4` |
| **Behavioral Health** | BHM + BHIS — PHQ-9/GAD-7 screening, treatment plans, provider caseload management | Violet `#A855F7` |
| **Cost Explorer** | Claims cost analysis, utilization metrics, MLR analysis, preventable ER identification | Red `#EF4444` |
| **Payer Analytics** | Multi-payer comparison dashboards — quality, HCC, ER, costs, Rx, referrals, KPIs | Orange `#F97316` |
| **BridgeIQ** | Interoperability Hub — FHIR R4, HL7, unified patient timeline, provider messaging, network directory | Blue `#3B82F6` |
| **ChartIQ** | AI Chart Summarization — links to [chartiq.kosiq.ai](https://chartiq.kosiq.ai) | Teal `#14B8A6` |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM + SQLite (PostgreSQL for production)
- **Auth**: NextAuth.js (Credentials provider, JWT sessions)
- **Charts**: Recharts
- **AI**: Claude (Anthropic) via API — chat widget on every authenticated page
- **Design**: Apple.com-inspired light theme, Inter font

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/suareyai-spec/kosiq.git
cd kosiq
npm install
```

### Environment Variables

Create `.env` in the project root:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3003
ANTHROPIC_API_KEY=your-key-here
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

The seed script creates 500 Medicare Advantage patients, ~35,000 claims, 200 ENS events, and 12 monthly reports.

### Run Development Server

```bash
npm run dev -- -p 3003
```

### Production Build

```bash
npm run build
npm start -- -p 3003
```

## Project Structure

```
kosiq/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── seed.ts             # Seed data generator
│   └── dev.db              # SQLite database
├── src/
│   ├── app/
│   │   ├── api/            # API routes (dashboard, patients, analytics, etc.)
│   │   ├── auth/           # Login & signup pages
│   │   ├── cliniq/         # ClinIQ product pages
│   │   ├── risk-engine/    # Risk Engine pages (HCC, ARC)
│   │   ├── quality/        # Quality pages (HEDIS, PCMH, gaps, providers)
│   │   ├── care-management/# Care Management pages (CCM, PCM, TCM, APCM)
│   │   ├── rpm/            # RPM pages (devices, vitals, alerts, work queue)
│   │   ├── behavioral-health/ # BH pages (screenings, BHM, BHIS, caseload)
│   │   ├── cost-explorer/  # Cost Explorer pages (claims, utilization, MLR, ER)
│   │   ├── payer-analytics/# Payer Analytics pages (8 sub-pages)
│   │   ├── bridgeiq/       # BridgeIQ pages (timeline, records, messaging, FHIR)
│   │   ├── population-health/ # AtlasIQ population health dashboard
│   │   ├── predictive/     # Predictive AI analytics
│   │   ├── prescriptive/   # Prescriptive AI recommendations
│   │   └── layout.tsx      # Root layout with providers
│   ├── components/
│   │   ├── Sidebar.tsx     # Product-aware sidebar navigation
│   │   ├── ProductSwitcher.tsx # Product dropdown switcher
│   │   ├── DashboardLayout.tsx # Authenticated layout wrapper
│   │   ├── AIChatWidget.tsx    # Global AI chat assistant
│   │   ├── Modal.tsx       # Reusable modal component
│   │   ├── Toast.tsx       # Toast notification system
│   │   └── Providers.tsx   # Session + Toast context providers
│   └── lib/
│       └── products.ts     # Product configuration (routes, colors, nav items)
├── public/
│   ├── logo.svg            # KOSIQ logo (KOS dark + IQ blue)
│   └── favicon.svg         # Blue "IQ" favicon
├── generate-pricing-pdf.js     # Pricing guide PDF generator
├── generate-revenue-roadmap.js # Revenue roadmap PDF generator
├── generate-pitch-pdf-v2.js    # Investor pitch deck PDF generator
├── generate-roadmap-pdf.js     # 18-month roadmap PDF generator
└── TODO.md                     # Master to-do list
```

## Key Features

- **Product Switcher**: Dropdown at top-left of sidebar — each product has unique accent color and navigation
- **Drill-Down Analytics**: Click providers → see their patients. Click measures → see gaps. Click MLR → see cost drivers.
- **Interactive UI**: Sortable tables, real-time search/filter, modals, toast notifications, inline editing, status toggles
- **AI Chat Widget**: Claude-powered assistant on every authenticated page
- **PHQ-9/GAD-7 Scoring**: Functional screening tools with auto-calculated scores
- **FHIR R4 Monitoring**: API traffic charts, resource distribution, endpoint health

## Authentication

Default admin logins:
- `suarey@gmail.com` / `admin123`
- `suareyai@gmail.com` / `admin123`

## Deployment

Currently deployed via PM2 on a Hostinger VPS with Caddy reverse proxy (auto HTTPS via Let's Encrypt).

```bash
pm2 stop kosiq
npm run build
pm2 start kosiq
```

## Investor Materials

Generated PDFs (not publicly accessible):
- `KOSIQ-Investor-Pitch-2026.pdf` — 18-slide pitch deck
- `KOSIQ-Roadmap-2026.pdf` — 18-month product roadmap
- `KOSIQ-Pricing-Guide-2026.pdf` — Product & pricing guide (6 pages)
- `KOSIQ-Revenue-Roadmap-2026.pdf` — 12/24-month revenue projections (6 pages)
- `KOSIQ-Term-Sheet-2026.pdf` — Investment term sheet

## Production Roadmap

See `TODO.md` for the full master checklist. Key milestones:
1. Florida C-Corp formation + EIN
2. Seed raise ($500K-$1.5M)
3. HIPAA certification (Month 3)
4. AWS migration (PostgreSQL, Bedrock for Claude)
5. First paying client (Month 4)
6. SOC 2 Type I (Month 6)
7. HITRUST (Month 18)

## License

Proprietary. All rights reserved.

## Contact

- David Suarez, Co-Founder & CPO — david@kosiq.ai
- Dr. JD Suarez, Co-Founder & CMO
- Support: support@kosiq.ai
