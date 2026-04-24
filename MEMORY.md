# MEMORY.md — Long-Term Memory

## About David
- Name: David Suarez
- Telegram ID: 8579959114
- GitHub: suareyai-spec
- Primary device: Mac Mini (hostname Davids-Mac-mini-2, user davidsuarezai)
- Server: srv1347154 (Hostinger VPS, Linux, IP 187.77.4.249, Tailscale 100.84.20.21)
- Not very tech-savvy — keep instructions simple and step-by-step
- Budget-conscious — always confirm costs before spending
- Prefers clean modern UI, celadon green color, no emojis
- Wants to build and monetize software products

## Infrastructure
- OpenClaw running on srv1347154 with Claude Opus 4.6
- Heartbeats: DISABLED (David prefers on-demand only)
- PM2 manages apps (bookwriter-mvp port 3000, mission-control port 3001)
- Git identity configured on server (suareyai)
- Tailscale connects Mac Mini to server

## Projects
### MyBook (bookwriter-mvp)
- AI book generator web app, Claude Opus powered
- GitHub: https://github.com/suareyai-spec/bookwriter-mvp
- Port 3000, PM2 managed
- Features: genre/tone/audience/language/length selection, chapter-by-chapter generation, PDF + docx export
- Branding: "My Book", Playfair Display serif font, dark theme

### Celadon Dashboard (mission-control)
- Agent monitoring dashboard
- Port 3001, PM2 managed
- Celadon green theme, Helvetica Neue, Apple Liquid Glass UI, sidebar layout
- Pages: Dashboard, Activity, Projects, Calendar, Search

## API Keys Connected
- Anthropic (Claude Opus) — via OpenClaw auth
- OpenAI — $10 added to platform account
- Brave Search — free tier

## Budget
- David's rule: $10 initial cap for building
- Estimated total spend so far: ~$12+ (exceeded initial cap with heavy Opus usage)

## David Personal
- Cuban American
- Admin email: suarey@gmail.com (always free access on all apps)
- Stripe account: acct_1MF2tGE0VElgdnsM

## MyBook Features (current)
- User auth (NextAuth + Prisma + SQLite)
- Book library with versions
- Streaming generation with progress bar
- Reference materials (PDF, Google Docs, text)
- Smart revisions (only affected chapters)
- Auto-detected citation styles (AMA, APA, Bluebook, IEEE, Chicago, Harvard)
- Stripe payments (3 plans + credits + Epic add-on)
- Privacy Policy + Terms of Service
- Admin bypass for suarey@gmail.com

## Domain & Hosting
- Domain: plotghost.ai (Cloudflare Registrar)
- Caddy reverse proxy with auto HTTPS (Let's Encrypt)
- Hostinger firewall: ports 22, 80, 443 open
- Zero-downtime deploy script: bookwriter-mvp/deploy.sh

## Narevo API
- Social media scheduling API at /home/suareyai/.openclaw/workspace/narevo-api
- Port 3002, PM2 process: narevo-api
- Express.js + TypeScript + Prisma + PostgreSQL + Redis/BullMQ
- Domain: api.narevo.ai (Namecheap DNS)
- API key: nrv_b6a84123c4b24472a98a94af6cf1a33d
- DB: narevo_db, user: narevo (PostgreSQL on localhost)
- Features: post scheduling (FB/IG/YT/TikTok), AI captions, analytics, branded PDF reports
- Security: AES-256 encryption, rate limiting, audit logging, IP allowlisting
- David wants to sell as multi-tenant SaaS (cheaper Ayrshare alternative)
- narevo.io frontend built by separate developer (Next.js, hosted elsewhere)

## KOSIQ (Healthcare Operating System)
- AI Healthcare Platform at /home/suareyai/.openclaw/workspace/kosiq
- Port 3003, Next.js + Prisma + SQLite
- David building with his dad (doctor, CMO of healthcare group in Florida)
- Target: managed care practices, 1,000-60,000+ patients; also payers
- **16 products**: AtlasIQ, ClinIQ, ChartIQ, CoreIQ (EMR), Risk Engine, Quality, Care Management, Cost Explorer, RPM, Behavioral Health, Payer Analytics, BridgeIQ, FraudIQ, ClaimIQ, AuthIQ, ComplianceIQ
- Patient 360 page with cross-product unified timeline
- 20 featured patients seeded across all products
- Design: light Apple.com theme, white/#f5f5f7, #0071e3 accent, Inter font
- Positioned as "The Operating System for Value-Based Care"
- For investor demo + White House pitch — using realistic dummy data
- Payers: Simply Health, Sunshine Health, Humana, Aetna Better Health, Molina, WellCare
- Dad's practice uses eClinicalWorks — analyzed 14 screenshots + 120+ template list for feature parity
- Next: Note Templates, Room In/Out, Document Management, Senior Care Roster

## American Institute of Clinical Education (AICE)
- CME LMS platform at /home/suareyai/.openclaw/workspace/kosiq-learn
- Port 3005, PM2 process: kosiq-learn, live at https://learn.kosiq.ai
- **Separate brand from KOSIQ** — no KOSIQ references
- Navy #1B365D + Gold #C5960C, Apple/Udemy design
- Single course: "Value-Based Care Essentials" by Dr. JD, $1,500, 6.0 AMA credits
- 54 quiz questions, 22 downloadable PDFs, interactive course player
- Full admin: course editor, student management, revenue/coupons, certificates, email templates
- Coupons seeded: WELCOME20, VBC500, FREECME
- Public cert verification at /verify/[certificateNumber]
- Needs: Stripe keys, Klaviyo for emails, real video URLs, PostgreSQL for production

## David Personal
- Cuban American
- Admin email: suarey@gmail.com (always free access on all apps)
- Stripe account: acct_1MF2tGE0VElgdnsM
- Dad is Dr. J.D. Suarez, CMO of a healthcare group in Florida — partner on KOSIQ
- Dad's email: drjdsuarez@gmail.com (has Plot Ghost account)

## KOSIQ Clinical Requirements (from Dr. J.D.)
- SMI program: flag metabolic + mental health patients
- HIV: find patients not in Clear Choice Alliance
- ESRD: patients needing specialized insurance
- CKD Stage 3b/4: early intervention before ESRD
- HbA1c > 9: aggressive diabetes therapy
- Asthma/COPD frequent hospitalizers: medication review
- 40% of ER patients never seen their PCP — flag unengaged members
- Age-provider mismatch: kids assigned to geriatric docs, adults to pediatricians

## ChartIQ (Clinical Chart Summarization)
- AI-powered chart note summarization tool for hospitals
- Path: /home/suareyai/.openclaw/workspace/chartiq, port 3004
- Live at https://chartiq.kosiq.ai
- PM2 process: chartiq
- Second product under KOSIQ umbrella company
- Logo: "Chart" dark + "IQ" blue (#26acf7)
- Login: suarey@gmail.com / admin123

## Trading
- Alpaca paper trading account connected (alpaca-trader/.env)
- Kalshi prediction market account connected (alpaca-trader/kalshi.py + kalshi_key.pem)
- Kalshi balance: $100 real money
- David prefers prediction markets over stock options
- Budget: $100 per trade max

## David Personal
- Title in KOSIQ: Chief Product Officer (changed from CTO, Feb 28)
- Real estate deal: assembling 2 plots in downtown Miami ($11.5M), finder's fee agreement sent

## Potential Future Products
- WiseStamp competitor (email signature generator) — David interested, not started
