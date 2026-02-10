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
- Estimated total spend so far: ~$7
