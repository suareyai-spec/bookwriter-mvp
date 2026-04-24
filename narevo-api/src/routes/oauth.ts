import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../index';
import { encrypt } from '../services/encryption';
import * as metaService from '../services/meta';
import * as youtubeService from '../services/youtube';
import * as tiktokService from '../services/tiktok';

const router = Router();

const CALLBACK_BASE = () => process.env.OAUTH_CALLBACK_BASE || 'https://api.narevo.ai';

function buildCallbackUrl(platform: string): string {
  return `${CALLBACK_BASE()}/api/oauth/${platform}/callback`;
}

// ─── GET /:platform/authorize ────────────────────────────────────────────────

router.get('/:platform/authorize', async (req: Request, res: Response) => {
  try {
    const platform = String(req.params.platform);
    const redirectUri = String(req.query.redirectUri || '');

    if (!redirectUri) {
      res.status(400).json({ error: 'redirectUri query param is required' });
      return;
    }

    const state = crypto.randomBytes(32).toString('hex');

    // Store state for CSRF protection
    await prisma.oAuthState.create({
      data: { state, platform, redirectUri },
    });

    let authUrl: string;
    const callbackUrl = buildCallbackUrl(platform);

    switch (platform) {
      case 'meta':
        authUrl = `https://www.facebook.com/v21.0/dialog/oauth?` +
          `client_id=${process.env.META_APP_ID}` +
          `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
          `&state=${state}` +
          `&scope=pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish,instagram_manage_insights,business_management`;
        break;

      case 'youtube':
        authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
          `client_id=${process.env.YOUTUBE_CLIENT_ID}` +
          `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
          `&response_type=code` +
          `&state=${state}` +
          `&scope=${encodeURIComponent('https://www.googleapis.com/auth/youtube https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/yt-analytics.readonly')}` +
          `&access_type=offline&prompt=consent`;
        break;

      case 'tiktok':
        authUrl = `https://www.tiktok.com/v2/auth/authorize/?` +
          `client_key=${process.env.TIKTOK_CLIENT_KEY}` +
          `&redirect_uri=${encodeURIComponent(callbackUrl)}` +
          `&state=${state}` +
          `&scope=user.info.basic,video.publish,video.list` +
          `&response_type=code`;
        break;

      default:
        res.status(400).json({ error: `Unsupported platform: ${platform}` });
        return;
    }

    res.json({ authUrl });
  } catch (err: any) {
    console.error('[OAUTH] Authorize error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /:platform/callback ─────────────────────────────────────────────────

router.get('/:platform/callback', async (req: Request, res: Response) => {
  try {
    const platform = String(req.params.platform);
    const code = String(req.query.code || '');
    const state = String(req.query.state || '');
    const error = req.query.error ? String(req.query.error) : '';

    if (error) {
      console.error(`[OAUTH] ${platform} callback error:`, error);
      const oauthState = state ? await prisma.oAuthState.findUnique({ where: { state } }) : null;
      const redirectUri = oauthState?.redirectUri || 'https://narevo.io';
      res.redirect(`${redirectUri}?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!code || !state) {
      res.status(400).json({ error: 'Missing code or state' });
      return;
    }

    // Validate state for CSRF
    const oauthState = await prisma.oAuthState.findUnique({ where: { state } });
    if (!oauthState || oauthState.platform !== platform) {
      res.status(400).json({ error: 'Invalid or expired state' });
      return;
    }

    // Clean up state record
    await prisma.oAuthState.delete({ where: { id: oauthState.id } });

    const callbackUrl = buildCallbackUrl(platform);
    let account;

    switch (platform) {
      case 'meta': {
        const tokens = await metaService.exchangeCodeForToken(code, callbackUrl);
        const pages = await metaService.getPages(tokens.accessToken);

        // Create accounts for each page (and linked Instagram if available)
        const accounts = [];
        for (const page of pages) {
          // Facebook Page account
          const fbAccount = await prisma.account.create({
            data: {
              platform: 'facebook',
              platformAccountId: page.id,
              accountName: page.name,
              accessToken: encrypt(page.access_token || tokens.accessToken),
              refreshToken: null, // Meta uses long-lived tokens
              tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
              metadata: { pageCategory: page.category },
            },
          });
          accounts.push(fbAccount);

          // Check for linked Instagram
          const igId = await metaService.getInstagramAccount(page.id, tokens.accessToken);
          if (igId) {
            const igAccount = await prisma.account.create({
              data: {
                platform: 'instagram',
                platformAccountId: igId,
                accountName: `${page.name} (Instagram)`,
                accessToken: encrypt(page.access_token || tokens.accessToken),
                refreshToken: null,
                tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
                metadata: { instagramAccountId: igId, linkedPageId: page.id },
              },
            });
            accounts.push(igAccount);
          }
        }

        const accountIds = accounts.map(a => a.id).join(',');
        res.redirect(`${oauthState.redirectUri}?success=true&platform=meta&accounts=${accountIds}`);
        return;
      }

      case 'youtube': {
        const tokens = await youtubeService.exchangeCodeForToken(code, callbackUrl);
        const channel = await youtubeService.getChannel(tokens.accessToken);

        if (!channel) {
          res.redirect(`${oauthState.redirectUri}?error=no_channel`);
          return;
        }

        account = await prisma.account.create({
          data: {
            platform: 'youtube',
            platformAccountId: channel.id,
            accountName: channel.snippet.title,
            accessToken: encrypt(tokens.accessToken),
            refreshToken: encrypt(tokens.refreshToken),
            tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
            metadata: {
              channelId: channel.id,
              thumbnail: channel.snippet.thumbnails?.default?.url,
            },
          },
        });
        break;
      }

      case 'tiktok': {
        const tokens = await tiktokService.exchangeCodeForToken(code, callbackUrl);
        const user = await tiktokService.getUserInfo(tokens.accessToken);

        account = await prisma.account.create({
          data: {
            platform: 'tiktok',
            platformAccountId: tokens.openId,
            accountName: user?.display_name || tokens.openId,
            accessToken: encrypt(tokens.accessToken),
            refreshToken: encrypt(tokens.refreshToken),
            tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
            metadata: {
              openId: tokens.openId,
              avatarUrl: user?.avatar_url,
              refreshExpiresAt: new Date(Date.now() + tokens.refreshExpiresIn * 1000).toISOString(),
            },
          },
        });
        break;
      }

      default:
        res.status(400).json({ error: `Unsupported platform: ${platform}` });
        return;
    }

    res.redirect(`${oauthState.redirectUri}?success=true&platform=${platform}&accountId=${account!.id}`);
  } catch (err: any) {
    console.error(`[OAUTH] Callback error for ${req.params.platform}:`, err.response?.data || err.message);
    res.status(500).json({ error: 'OAuth callback failed', details: err.message });
  }
});

export default router;
