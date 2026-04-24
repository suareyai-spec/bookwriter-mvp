# KOSIQ — Master To-Do List
*Last updated: March 2, 2026*

---

## 1. CORPORATE & LEGAL (Do First)
- [ ] **Form Florida C-Corp** — File Articles of Incorporation with FL Division of Corporations (~$70)
- [ ] **Get EIN** — Apply on IRS.gov (free, instant)
- [ ] **Open business bank account** — Mercury or Relay (free, startup-friendly)
- [ ] **Draft operating/shareholder agreement** — Equity split, board seats, roles (you + investor)
- [ ] **Healthcare IP attorney review** (~$500) — Confirm ARC, BridgeIQ, CIPHR naming is clean; no trademark conflicts
- [ ] **Trademark filings** — "KOSIQ", "ChartIQ", "AtlasIQ", "BridgeIQ", "ARC" (~$250-350 each via USPTO)
- [ ] **Business insurance** — General liability + E&O (errors & omissions); ~$1-2K/year
- [ ] **Support email setup** — support@kosiq.ai, david@kosiq.ai

## 2. INVESTOR MATERIALS (Ready to Send)
- [x] Pitch deck PDF (18 slides) ✅
- [x] 18-month roadmap PDF ✅
- [x] Term sheet PDF ✅
- [ ] **Update pitch deck** to reflect multi-product platform (11 products vs single app)
- [ ] **One-pager / executive summary** — 1-page PDF for cold outreach
- [ ] **Financial model spreadsheet** — Revenue projections, burn rate, breakeven (investors will ask)
- [ ] **Demo video** — 3-5 min screen recording walking through the platform
- [ ] **Data room** — Google Drive folder with all docs organized (deck, terms, financials, roadmap, compliance plan)

## 3. HIPAA & COMPLIANCE (Start After Funding)
- [ ] **Hire HIPAA compliance consultant** — Dash Solutions, Compliancy Group, or similar (~$15-30K)
- [ ] **Complete HIPAA Risk Assessment** — Required before handling any real PHI
- [ ] **Write HIPAA policies & procedures** — Privacy, Security, Breach Notification (~40 documents)
- [ ] **BAA template** — Business Associate Agreement for clients and vendors
- [ ] **Employee/contractor HIPAA training** — Annual requirement
- [ ] **AWS environment setup** — HIPAA-eligible services, BAA with AWS, encryption at rest + transit
- [ ] **AWS Bedrock for Claude** — Switch from direct Anthropic API to Bedrock (AWS signs BAA)
- [ ] **Penetration test** — Required for SOC 2; ~$10-20K
- [ ] **SOC 2 Type I audit** — ~$20-50K; 3-4 month process
- [ ] **Cyber liability insurance** — Required by most healthcare clients; ~$2-5K/year
- [ ] **HITRUST certification** (Phase 2, after revenue) — $100-200K, 8-14 months

## 4. TECHNICAL — PRODUCTION READINESS
- [ ] **Migrate from SQLite to PostgreSQL** — Required for multi-user production
- [ ] **Move to AWS** — EC2/ECS, RDS (PostgreSQL), S3, CloudFront
- [ ] **Real authentication** — Replace demo passwords; add SSO/SAML for enterprise clients
- [ ] **Role-based access control** — Admin, CMO, Care Manager, Analyst, Read-Only roles
- [ ] **Audit logging** — Track every data access (HIPAA requirement)
- [ ] **Data encryption** — AES-256 at rest, TLS 1.2+ in transit
- [ ] **Backup & disaster recovery plan** — Automated daily backups, tested restore process
- [ ] **Real data ingestion pipeline** — HL7/FHIR interfaces for actual hospital/payer data
- [ ] **Claims file parser** — 837/835 EDI file ingestion (this is how payers send data)
- [ ] **EHR integration** — HL7 v2.5 ADT/ORU feeds from hospital systems
- [ ] **FHIR R4 API** — For modern interoperability (required by CMS Interoperability Rule)
- [ ] **Multi-tenant architecture** — Each client's data fully isolated
- [ ] **Performance testing** — Must handle 50K+ patients per client smoothly

## 5. PRODUCT — BEFORE FIRST CLIENT
- [ ] **Replace dummy data with real data pipeline** — The demo is built; now wire it to real sources
- [ ] **ARC risk model** — Build actual risk scoring algorithm (not just demo tiers)
- [ ] **HCC coding gap detection** — Real V28 logic against claims data
- [ ] **HEDIS measure calculations** — Actual numerator/denominator logic per NCQA specs
- [ ] **Report generation** — Real PDF/Excel reports with client branding
- [ ] **Alert system** — Email/SMS notifications for clinical alerts (ENS events, critical labs)
- [ ] **User onboarding flow** — Client setup wizard, data mapping, validation
- [ ] **White-labeling option** — Some clients may want their own branding

## 6. SALES & GO-TO-MARKET
- [ ] **Target list** — 20-30 managed care groups in South Florida (20K-60K+ members)
- [ ] **Landing page updates** — Add case studies, testimonials (after first client)
- [ ] **Sales deck** (shorter than investor deck) — Focus on ROI, not equity
- [ ] **Pricing calculator** — Interactive tool showing PMPM cost vs savings
- [ ] **Contract template** — Master Services Agreement + BAA + SLA
- [ ] **Implementation timeline** — What does onboarding look like for a new client?
- [ ] **Dr. JD introductions** — Leverage his managed care network for warm intros
- [ ] **Conference presence** — HIMSS, AHIP, local FQHC/ACO meetups

## 7. TEAM (Hire After Funding)
- [ ] **Healthcare data engineer** — HL7/FHIR/claims expertise (first hire, ~$130-160K)
- [ ] **HIPAA compliance officer** — Can be fractional/consultant initially
- [ ] **Sales rep with healthcare experience** — Knows managed care buyers
- [ ] **Clinical advisor** (Dr. JD fills this as CMO)

## 8. ONGOING / NICE-TO-HAVE
- [ ] **ChartIQ cross-sell** — Bundle with KOSIQ for hospital clients
- [ ] **Mobile app** — iOS/Android for care managers in the field
- [ ] **API for third-party integrations** — Let clients build on top of KOSIQ
- [ ] **AI model fine-tuning** — Train on healthcare-specific data for better predictions
- [ ] **Patient engagement portal** — Patient-facing app (Phase 2+)

---

## PRIORITY ORDER
1. **Investor materials** (update deck, financial model, demo video) — THIS WEEK
2. **Corporate formation** (C-Corp, EIN, bank account) — THIS WEEK  
3. **Raise capital** ($500K-$1.5M seed) — NEXT 1-3 MONTHS
4. **Hire data engineer + start HIPAA** — MONTH 1-2 OF FUNDING
5. **Production infrastructure** (AWS, PostgreSQL, security) — MONTH 2-3
6. **First client pilot** — MONTH 4-5
7. **SOC 2 + scale** — MONTH 6+
