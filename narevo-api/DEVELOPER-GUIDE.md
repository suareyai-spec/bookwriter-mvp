# Narevo API — Developer Integration Guide

**Base URL:** `https://api.narevo.ai`
**Auth:** All requests require `Authorization: Bearer <API_KEY>` header

Your API Key:
```
nrv_b6a84123c4b24472a98a94af6cf1a33d
```

---

## Quick Start

Test the connection:
```bash
curl https://api.narevo.ai/api/health
# → {"status":"ok","timestamp":"2026-02-12T00:00:00.000Z"}
```

---

## 1. Connect a Social Account

When a user connects their Facebook/Instagram/YouTube/TikTok via OAuth on your frontend, send the tokens to the API:

```bash
curl -X POST https://api.narevo.ai/api/accounts/connect \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "instagram",
    "platformAccountId": "17841400123456",
    "accountName": "mybrandofficial",
    "accessToken": "IGQVJWZAxxxxxxxxx...",
    "refreshToken": "IGROxxxxxxxxx...",
    "tokenExpiresAt": "2026-04-01T00:00:00Z"
  }'
```

**Response:**
```json
{
  "id": "abc123-uuid",
  "platform": "instagram",
  "platformAccountId": "17841400123456",
  "accountName": "mybrandofficial",
  "createdAt": "2026-02-12T00:00:00Z"
}
```

> Tokens are AES-256 encrypted at rest. They are never returned in API responses.

**Platforms:** `facebook` | `instagram` | `youtube` | `tiktok`

---

## 2. List Connected Accounts

```bash
curl https://api.narevo.ai/api/accounts \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d"
```

**Response:**
```json
[
  {
    "id": "abc123-uuid",
    "platform": "instagram",
    "accountName": "mybrandofficial",
    "createdAt": "2026-02-12T00:00:00Z"
  }
]
```

> Note: Tokens are excluded from list responses for security.

---

## 3. Schedule a Post

```bash
curl -X POST https://api.narevo.ai/api/posts/schedule \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "abc123-uuid",
    "platform": "instagram",
    "content": "Excited to announce our summer collection! Link in bio.",
    "mediaUrls": ["https://cdn.example.com/photo1.jpg"],
    "thumbnailUrl": null,
    "scheduledAt": "2026-02-15T14:00:00Z"
  }'
```

**Response:**
```json
{
  "id": "post-uuid",
  "accountId": "abc123-uuid",
  "platform": "instagram",
  "content": "Excited to announce our summer collection! Link in bio.",
  "mediaUrls": ["https://cdn.example.com/photo1.jpg"],
  "status": "scheduled",
  "scheduledAt": "2026-02-15T14:00:00Z",
  "createdAt": "2026-02-12T00:00:00Z"
}
```

**Post statuses:** `draft` → `scheduled` → `publishing` → `published` or `failed`

The API automatically publishes the post at the scheduled time. If it fails, `status` becomes `failed` and `errorMessage` will explain why.

---

## 4. Publish Immediately

```bash
curl -X POST https://api.narevo.ai/api/posts/publish \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "abc123-uuid",
    "platform": "facebook",
    "content": "Hello world! Our page is live."
  }'
```

---

## 5. List / Filter Posts

```bash
# All posts
curl "https://api.narevo.ai/api/posts" \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d"

# Filter by status
curl "https://api.narevo.ai/api/posts?status=scheduled" \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d"

# Filter by platform and date range
curl "https://api.narevo.ai/api/posts?platform=instagram&startDate=2026-02-01&endDate=2026-02-28" \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d"
```

---

## 6. Update a Scheduled Post

```bash
curl -X PUT https://api.narevo.ai/api/posts/post-uuid \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated caption! Check out our summer sale.",
    "scheduledAt": "2026-02-16T10:00:00Z"
  }'
```

> Only works for posts with status `scheduled` or `draft`.

---

## 7. Delete / Cancel a Post

```bash
curl -X DELETE https://api.narevo.ai/api/posts/post-uuid \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d"
```

---

## 8. Generate AI Captions

```bash
curl -X POST https://api.narevo.ai/api/captions/generate \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d" \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "summer fashion collection launch",
    "platform": "instagram",
    "tone": "engaging",
    "length": "medium",
    "count": 3
  }'
```

**Response:**
```json
{
  "captions": [
    {
      "text": "Summer just got a whole lot better. Our new collection drops NOW — bold prints, breezy fits, and colors that pop. Which piece are you grabbing first?",
      "hashtags": ["#SummerFashion", "#NewCollection", "#StyleDrop", "#OOTD", "#FashionLaunch"]
    },
    {
      "text": "We spent months perfecting every stitch. The result? A summer collection that moves with you. Tap to shop before your size is gone.",
      "hashtags": ["#SummerStyle", "#NewArrivals", "#FashionForward", "#ShopNow"]
    },
    {
      "text": "Hot girl summer starts here. 15 new pieces. Zero compromises. Available now — link in bio.",
      "hashtags": ["#SummerVibes", "#NewDrop", "#FashionInspo", "#MustHave"]
    }
  ]
}
```

**Options:**
| Parameter | Values | Default |
|-----------|--------|---------|
| `topic` | Any string describing the post | required |
| `platform` | `instagram`, `facebook`, `youtube`, `tiktok` | required |
| `tone` | `professional`, `casual`, `funny`, `engaging` | `engaging` |
| `length` | `short`, `medium`, `long` | `medium` |
| `count` | 1-5 | 3 |

Captions are optimized per platform (Instagram = hashtag-heavy, TikTok = trendy/short, YouTube = SEO-friendly, Facebook = conversational).

---

## 9. Get Analytics

```bash
# Raw analytics data
curl "https://api.narevo.ai/api/analytics/abc123-uuid?startDate=2026-02-01&endDate=2026-02-28" \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d"
```

**Response:**
```json
[
  {
    "id": "analytics-uuid",
    "platform": "instagram",
    "date": "2026-02-12",
    "followers": 12450,
    "impressions": 8930,
    "reach": 6200,
    "engagement": 4.2,
    "likes": 340,
    "comments": 28,
    "shares": 15,
    "clicks": 89
  }
]
```

---

## 10. Get Analytics Summary

```bash
curl "https://api.narevo.ai/api/analytics/abc123-uuid/summary?startDate=2026-02-01&endDate=2026-02-28" \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d"
```

**Response:**
```json
{
  "totalRecords": 28,
  "totals": {
    "followers": 12450,
    "impressions": 250440,
    "reach": 173600,
    "likes": 9520,
    "comments": 784,
    "shares": 420,
    "clicks": 2492
  },
  "averageEngagement": 3.8
}
```

---

## 11. Generate Branded Monthly Report (PDF)

```bash
curl -X POST https://api.narevo.ai/api/analytics/report \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d" \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "abc123-uuid",
    "period": "2026-02",
    "brandName": "MyBrand",
    "brandLogo": "https://cdn.example.com/logo.png",
    "brandColor": "#FF6B35"
  }'
```

**Response:**
```json
{
  "id": "report-uuid",
  "accountId": "abc123-uuid",
  "period": "2026-02",
  "filePath": "/reports/report-uuid.pdf",
  "generatedAt": "2026-02-12T00:00:00Z"
}
```

---

## 12. Disconnect an Account

```bash
curl -X DELETE https://api.narevo.ai/api/accounts/abc123-uuid \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d"
```

---

## 13. Refresh OAuth Token

```bash
curl -X POST https://api.narevo.ai/api/accounts/abc123-uuid/refresh \
  -H "Authorization: Bearer nrv_b6a84123c4b24472a98a94af6cf1a33d"
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| Schedule/publish posts | 100/hour |
| AI caption generation | 50/hour |
| Analytics queries | 200/hour |
| All other endpoints | 1000/hour |

Rate limit headers are included in every response:
- `X-RateLimit-Limit` — max requests per window
- `X-RateLimit-Remaining` — requests left
- `X-RateLimit-Reset` — Unix timestamp when the window resets

If exceeded, you'll get `429 Too Many Requests` with a `Retry-After` header.

---

## Error Handling

All errors return JSON:
```json
{
  "error": "Description of what went wrong"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request — missing or invalid fields |
| 401 | Unauthorized — missing or invalid API key |
| 403 | Forbidden — IP not in allowlist |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

## Security

- All OAuth tokens are **AES-256 encrypted** at rest
- **HTTPS only** (TLS 1.2+)
- All mutating requests are **audit logged** (who, what, when, from where)
- Optional **IP allowlisting** per API key
- Security headers: HSTS, nosniff, frame deny

---

## OAuth Flow (How to Connect Accounts)

Your frontend handles the OAuth redirect flow for each platform. Once the user authorizes and you receive the access token + refresh token, send them to `POST /api/accounts/connect`. The API encrypts and stores them securely.

### Meta (Facebook + Instagram)
1. Redirect user to: `https://www.facebook.com/v18.0/dialog/oauth?client_id={META_APP_ID}&redirect_uri={YOUR_CALLBACK}&scope=pages_manage_posts,instagram_basic,instagram_content_publish`
2. Exchange code for token at: `https://graph.facebook.com/v18.0/oauth/access_token`
3. Exchange short-lived token for long-lived token (60 days)
4. Send to `POST /api/accounts/connect`

### YouTube
1. Redirect user to: `https://accounts.google.com/o/oauth2/v2/auth?client_id={CLIENT_ID}&redirect_uri={YOUR_CALLBACK}&scope=https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/yt-analytics.readonly`
2. Exchange code for tokens at: `https://oauth2.googleapis.com/token`
3. Send to `POST /api/accounts/connect`

### TikTok
1. Redirect user to: `https://www.tiktok.com/v2/auth/authorize/?client_key={CLIENT_KEY}&redirect_uri={YOUR_CALLBACK}&scope=video.upload,video.list`
2. Exchange code for tokens at: `https://open.tiktokapis.com/v2/oauth/token/`
3. Send to `POST /api/accounts/connect`

---

## Questions?

Contact David Suarez — suarey@gmail.com
