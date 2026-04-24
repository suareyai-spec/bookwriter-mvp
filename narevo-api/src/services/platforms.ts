import { Account, Post } from '@prisma/client';
import { publishToFacebook, publishToInstagram, refreshMetaToken } from './meta';
import { uploadVideo, refreshYouTubeToken } from './youtube';
import { publishToTikTok, refreshTikTokToken } from './tiktok';
import { encrypt, decrypt } from './encryption';
import { prisma } from '../index';

/** Returns a copy of the account with decrypted tokens for platform use */
export function decryptAccountTokens(account: Account): Account {
  return {
    ...account,
    accessToken: decrypt(account.accessToken),
    refreshToken: account.refreshToken ? decrypt(account.refreshToken) : null,
  };
}

export async function publishPostToPlatform(
  account: Account, post: Post
): Promise<{ platformPostId: string }> {
  const decrypted = decryptAccountTokens(account);
  const mediaUrls = Array.isArray(post.mediaUrls) ? post.mediaUrls as string[] : [];

  switch (post.platform) {
    case 'facebook':
      return publishToFacebook(decrypted, post.content, mediaUrls);
    case 'instagram':
      return publishToInstagram(decrypted, post.content, mediaUrls);
    case 'youtube':
      return uploadVideo(decrypted, mediaUrls[0] || '', post.content, '', []);
    case 'tiktok':
      return publishToTikTok(decrypted, post.content, mediaUrls[0]);
    default:
      throw new Error(`Unsupported platform: ${post.platform}`);
  }
}

export async function refreshTokenForAccount(account: Account): Promise<any> {
  const decrypted = decryptAccountTokens(account);
  let result: { accessToken: string; refreshToken?: string; expiresAt: Date };

  switch (account.platform) {
    case 'facebook':
    case 'instagram':
      result = await refreshMetaToken(decrypted);
      break;
    case 'youtube':
      result = await refreshYouTubeToken(decrypted);
      break;
    case 'tiktok':
      result = await refreshTikTokToken(decrypted);
      break;
    default:
      throw new Error(`Unsupported platform: ${account.platform}`);
  }

  const updateData: any = {
    accessToken: encrypt(result.accessToken),
    tokenExpiresAt: result.expiresAt,
  };
  if (result.refreshToken) {
    updateData.refreshToken = encrypt(result.refreshToken);
  }

  const updated = await prisma.account.update({
    where: { id: account.id },
    data: updateData,
  });

  return { success: true, tokenExpiresAt: updated.tokenExpiresAt };
}
