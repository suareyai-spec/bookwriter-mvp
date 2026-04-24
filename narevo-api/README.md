# Narevo API

Social media scheduling, AI caption generation, analytics, and reporting API for Facebook, Instagram, YouTube, and TikTok.

**Base URL:** `https://api.narevo.io` (or `http://localhost:3002`)

## Authentication

All endpoints (except `/api/health` and `/api/keys`) require an API key:

```
Authorization: Bearer nrv_your_api_key_here
```

Generate keys via:
```bash
curl -X POST /api/keys -H 'Content-Type: application/json' \
  -d '{"name":"my-app","masterSecret":"YOUR_MASTER_SECRET"}'
```

---

## Endpoints

### Health Check
```
GET /api/health
→ {"status":"ok","timestamp":"..."}
```

### API Keys
```
POST /api/keys
Body: {"name":"app-name","masterSecret":"..."}
→ {"id":"...","key":"nrv_...","name":"app-name"}
```

### Accounts

**Connect account:**
```
POST /api/accounts/connect
Body: {
  "platform": "instagram",
  "platformAccountId": "12345",
  "accountName": "mybrand",
  "accessToken": "...",
  "refreshToken": "...",
  "tokenExpiresAt": "2026-03-01T00:00:00Z"
}
→ Account object
```

**List accounts:**
```
GET /api/accounts
→ [Account objects (tokens excluded)]
```

**Disconnect:**
```
DELETE /api/accounts/:id
→ {"success":true}
```

**Refresh token:**
```
POST /api/accounts/:id/refresh
→ {"success":true,"tokenExpiresAt":"..."}
```

### Posts

**Schedule a post:**
```
POST /api/posts/schedule
Body: {
  "accountId": "...",
  "platform": "instagram",
  "content": "Check out our new product! 🚀",
  "mediaUrls": ["https://..."],
  "scheduledAt": "2026-02-15T14:00:00Z"
}
→ Post object with status "scheduled"
```

**Publish immediately:**
```
POST /api/posts/publish
Body: {
  "accountId": "...",
  "platform": "facebook",
  "content": "Hello world!"
}
→ Post object with status "published"
```

**List posts:**
```
GET /api/posts?status=scheduled&platform=instagram&startDate=2026-02-01&endDate=2026-02-28
→ [Post objects]
```

**Get/Update/Delete:**
```
GET    /api/posts/:id
PUT    /api/posts/:id  Body: {"content":"updated","scheduledAt":"..."}
DELETE /api/posts/:id
```

### AI Captions

**Generate captions:**
```
POST /api/captions/generate
Body: {
  "topic": "summer fashion collection launch",
  "platform": "instagram",
  "tone": "engaging",
  "length": "medium",
  "count": 3
}
→ {
  "captions": [
    {"text": "Summer is calling and we answered! ☀️...", "hashtags": ["summerfashion", "newcollection", ...]},
    ...
  ]
}
```

**Options:**
- `tone`: professional | casual | funny | engaging
- `length`: short | medium | long
- `platform`: instagram | facebook | youtube | tiktok

### Analytics

**Get analytics:**
```
GET /api/analytics/:accountId?startDate=2026-02-01&endDate=2026-02-28
→ [Analytics objects]
```

**Get summary:**
```
GET /api/analytics/:accountId/summary?startDate=2026-02-01&endDate=2026-02-28
→ {"totalRecords":28,"totals":{...},"averageEngagement":3.5}
```

**Generate report:**
```
POST /api/analytics/report
Body: {
  "accountId": "...",
  "period": "2026-02",
  "brandName": "MyBrand",
  "brandLogo": "https://...",
  "brandColor": "#FF6B35"
}
→ Report object
```

---

## Platform OAuth Setup

### Meta (Facebook/Instagram)
1. Create app at https://developers.facebook.com
2. Add Facebook Login and Instagram Basic Display products
3. Set `META_APP_ID` and `META_APP_SECRET` in `.env`
4. Exchange short-lived token for long-lived token via `/api/accounts/connect`

### YouTube
1. Create project at https://console.cloud.google.com
2. Enable YouTube Data API v3
3. Create OAuth 2.0 credentials
4. Set `YOUTUBE_CLIENT_ID` and `YOUTUBE_CLIENT_SECRET` in `.env`

### TikTok
1. Register at https://developers.tiktok.com
2. Create app with Content Posting API access
3. Set `TIKTOK_CLIENT_KEY` and `TIKTOK_CLIENT_SECRET` in `.env`

---

## Development

```bash
npm run dev    # Hot-reload dev server
npm run build  # Compile TypeScript
npm start      # Production server
```

## Security Features

### AES-256 Token Encryption
All OAuth tokens (accessToken, refreshToken) are encrypted at rest using AES-256-GCM. Tokens are stored as `iv:authTag:encryptedData` in base64. Set `ENCRYPTION_KEY` in `.env` (64-char hex string / 32 bytes).

### Rate Limiting
Built-in Map-based rate limiter with per-endpoint limits:
- `POST /api/posts/*` — 100 req/hr per API key
- `POST /api/captions/generate` — 50 req/hr per API key
- `GET /api/analytics/*` — 200 req/hr per API key
- `POST /api/keys` — 5 req/hr per IP
- General — 1000 req/hr per API key

Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`. Returns 429 with `Retry-After` when exceeded.

### Audit Logging
All mutating requests (POST, PUT, DELETE) are logged to the `AuditLog` table with API key ID, action, resource, IP, user agent, and metadata. Logging is asynchronous and doesn't block responses.

### IP Allowlisting
Optional per-API-key IP allowlisting. Set via:
```
PUT /api/keys/:id/allowed-ips
Body: { "masterSecret": "...", "allowedIps": ["1.2.3.4"] }
```
Set `allowedIps` to `null` to allow all IPs.

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security: max-age=31536000`
- `X-Powered-By` header removed
