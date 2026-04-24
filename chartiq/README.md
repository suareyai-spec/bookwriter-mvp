# ChartIQ — AI-Powered Clinical Chart Summarization

**Replaces manual chart reading during hospital shift handoffs. Summarizes hours of clinical notes in seconds.**

Live: [https://chartiq.kosiq.ai](https://chartiq.kosiq.ai)

---

## Overview

ChartIQ is an AI-powered clinical chart summarization tool designed for hospitals and healthcare facilities. Instead of nurses and physicians spending 30-60 minutes reading through chart notes during shift handoffs, ChartIQ uses Claude AI to generate instant SBAR (Situation, Background, Assessment, Recommendation) summaries.

ChartIQ is the second product under the KOSIQ umbrella — designed as a "trojan horse" to get into hospitals and cross-sell the full KOSIQ value-based care platform.

## Key Features

- **AI Shift Summaries**: Claude-powered summarization of patient chart notes into structured handoff reports
- **SBAR Handoff Reports**: Standardized Situation-Background-Assessment-Recommendation format
- **Patient Dashboard**: Overview of all patients with department grouping, acuity levels, and key metrics
- **Patient Detail (8 tabs)**: Summary, Vitals, Labs, Medications, Notes, Orders, Images, Profile
- **Voice Dictation**: Add clinical notes via Web Speech API voice-to-text
- **Global AI Chat**: Claude-powered chat widget on every page for clinical questions
- **Department Views**: ICU, Cardiology, Oncology, Neurology, Orthopedics, General Medicine

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma ORM + SQLite
- **Auth**: NextAuth.js (Credentials provider, JWT sessions)
- **AI**: Claude Sonnet (Anthropic) — summaries, SBAR generation, chat
- **Design**: Apple.com-inspired light theme, brand blue `#26acf7`, teal accent `#10b981`, Inter font

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/suareyai-spec/chartiq.git
cd chartiq
npm install
```

### Environment Variables

Create `.env` in the project root:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3004
ANTHROPIC_API_KEY=your-key-here
```

### Database Setup

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

The seed script creates 20 patients across 6 departments with comprehensive medical data.

### Run Development Server

```bash
npm run dev -- -p 3004
```

### Production Build

```bash
npm run build
npm start -- -p 3004
```

## Project Structure

```
chartiq/
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── seed.ts              # Seed data (20 patients, 6 departments)
│   └── dev.db               # SQLite database
├── src/
│   ├── app/
│   │   ├── (app)/           # Authenticated app routes
│   │   │   ├── dashboard/   # Main dashboard
│   │   │   ├── patients/    # Patient list + detail (8 tabs)
│   │   │   ├── handoff/     # SBAR handoff report generator
│   │   │   ├── settings/    # App settings
│   │   │   └── layout.tsx   # App layout with sidebar
│   │   ├── api/             # API routes
│   │   │   ├── auth/        # NextAuth endpoints
│   │   │   ├── dashboard/   # Dashboard stats
│   │   │   ├── patients/    # Patient CRUD + AI summary
│   │   │   ├── chat/        # AI chat endpoint
│   │   │   ├── handoff/     # SBAR generation
│   │   │   └── notes/       # Clinical notes (with voice dictation)
│   │   ├── auth/            # Login & signup pages
│   │   └── page.tsx         # Landing page
│   ├── components/
│   │   ├── GlobalChat.tsx   # AI chat widget (every page)
│   │   └── ...
│   └── lib/
│       └── ...
├── public/
│   ├── logo.svg             # ChartIQ logo (Chart dark + IQ blue)
│   └── favicon.svg          # Blue "IQ" favicon
├── generate-pitch-pdf.js    # Investor pitch deck generator
├── ChartIQ-Pitch-Deck-2026.pdf  # 14-slide pitch deck
└── VBC-Social-Media-Strategy-2026.pdf  # Social media content strategy
```

## Authentication

Default logins:
- `suarey@gmail.com` / `admin123`
- `suareyai@gmail.com` / `admin123`
- `demo@chartiq.ai` / `admin123`

Sidebar displays "Dr. Suarez" for authenticated users.

## Branding

- **Logo**: "Chart" in dark `#231f20` + "IQ" in blue `#26acf7`
- **Primary Blue**: `#26acf7`
- **Teal Accent**: `#10b981`
- **Font**: Inter
- **Theme**: Light Apple.com-inspired

## Pricing Model

Per-bed per month:
| Facility Size | Price |
|--------------|-------|
| Under 100 beds | $15/bed/month |
| 100-300 beds | $12/bed/month |
| 300-500 beds | $10/bed/month |
| 500+ beds | $8/bed/month |

## Deployment

Currently deployed via PM2 on a Hostinger VPS with Caddy reverse proxy at `chartiq.kosiq.ai`.

```bash
pm2 stop chartiq
npm run build
pm2 start chartiq
```

## Compliance

ChartIQ shares the KOSIQ compliance stack:
- HIPAA certification required before handling real PHI
- AWS Bedrock with Claude for production (AWS signs BAA)
- SOC 2 Type I planned for Month 6

## Competitive Advantage

Most competitors (Nuance DAX, Suki, Abridge) **create** clinical notes. ChartIQ **reads and summarizes** existing notes — solving a different problem (shift handoff efficiency) with no workflow change required.

## Investor Materials

- `ChartIQ-Pitch-Deck-2026.pdf` — 14-slide pitch deck
- `VBC-Social-Media-Strategy-2026.pdf` — TikTok + YouTube content strategy for Chapters 1-6

## License

Proprietary. All rights reserved.

## Contact

- David Suarez, Co-Founder & CPO — david@kosiq.ai
- Dr. JD Suarez, Co-Founder & CMO
- Support: support@kosiq.ai
