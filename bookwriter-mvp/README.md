# BookWriter MVP Scaffold

Web app scaffold for generating original books with:
- OpenAI generation route
- PDF export route
- Google Docs export hook
- Prisma schema for book storage

## 1) Install

```bash
npm install
cp .env.example .env.local
```

Fill `.env.local` (especially `OPENAI_API_KEY`).

## 2) DB setup

```bash
npx prisma generate
npx prisma db push
```

## 3) Run

```bash
npm run dev
```

Open http://localhost:3000

## Notes

- This is a budget-safe starter (small token limits in `lib/openai.ts`).
- Email login is prepared via env vars; wire NextAuth in the next step.
- Google Docs export endpoint is scaffolded, not fully implemented yet.

## Recommended next tasks

1. Add NextAuth email magic-link flow.
2. Persist generated content to DB.
3. Add chapter-by-chapter editor + version history.
4. Complete Google OAuth + Docs API export.
5. Add per-run dollar guardrails and usage dashboard.
