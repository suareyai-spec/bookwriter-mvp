import { Resend } from "resend";
import { SITE_URL } from "@/lib/config";

const FROM_ADDRESS = "PlotGhost <noreply@plotghost.ai>";
const APP_URL = SITE_URL;

let resendClient: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping email:", subject);
    return;
  }
  try {
    await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}

function wrapperHtml(bodyHtml: string): string {
  return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
  <div style="padding: 32px 24px;">
    ${bodyHtml}
    <p style="margin-top: 32px; font-size: 13px; color: #888;">— The PlotGhost Team</p>
  </div>
</div>`;
}

export async function sendGenerationCompleteEmail(params: {
  to: string;
  name?: string | null;
  contentTypeLabel: string;
  title: string;
  bookId: string;
  wordCount?: number;
}): Promise<void> {
  const { to, name, contentTypeLabel, title, bookId, wordCount } = params;
  const libraryUrl = `${APP_URL}/library/${bookId}`;
  const subject = `Your ${contentTypeLabel} is ready on PlotGhost`;
  const html = wrapperHtml(`
    <h1 style="font-size: 20px; margin-bottom: 16px;">Your ${escapeHtml(contentTypeLabel)} is ready!</h1>
    <p style="font-size: 15px; line-height: 1.6;">Hi ${escapeHtml(name || "there")},</p>
    <p style="font-size: 15px; line-height: 1.6;"><strong>${escapeHtml(title)}</strong> has finished generating${wordCount ? ` — ${wordCount.toLocaleString()} words` : ""}.</p>
    <p style="margin: 24px 0;">
      <a href="${libraryUrl}" style="background: #111; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Open in PlotGhost &rarr; edit, export, or share</a>
    </p>
  `);
  await send(to, subject, html);
}

export async function sendGenerationFailedEmail(params: {
  to: string;
  title: string;
  reason: string;
  creditsRefunded: number;
}): Promise<void> {
  const { to, title, reason, creditsRefunded } = params;
  const libraryUrl = `${APP_URL}/library`;
  const subject = `Your ${title} generation failed on PlotGhost`;
  const refundLine = creditsRefunded > 0
    ? `<p style="font-size: 15px; line-height: 1.6;">Your <strong>${creditsRefunded} credit${creditsRefunded === 1 ? "" : "s"}</strong> have been refunded to your account.</p>`
    : "";
  const html = wrapperHtml(`
    <h1 style="font-size: 20px; margin-bottom: 16px;">We couldn't finish your book</h1>
    <p style="font-size: 15px; line-height: 1.6;"><strong>${escapeHtml(title)}</strong> failed to generate.</p>
    ${refundLine}
    <p style="font-size: 13px; line-height: 1.6; color: #666;">Reason: ${escapeHtml(reason)}</p>
    <p style="margin: 24px 0;">
      <a href="${libraryUrl}" style="background: #111; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Go to your library</a>
    </p>
  `);
  await send(to, subject, html);
}

export async function sendPasswordResetEmail(params: { to: string; token: string }): Promise<void> {
  const { to, token } = params;
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;
  const subject = "Reset your PlotGhost password";
  const html = wrapperHtml(`
    <h1 style="font-size: 20px; margin-bottom: 16px;">Reset your password</h1>
    <p style="font-size: 15px; line-height: 1.6;">We received a request to reset the password for your PlotGhost account. This link expires in 1 hour.</p>
    <p style="margin: 24px 0;">
      <a href="${resetUrl}" style="background: #111; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Reset password</a>
    </p>
    <p style="font-size: 13px; line-height: 1.6; color: #666;">If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
  `);
  await send(to, subject, html);
}

export async function sendVerificationEmail(params: { to: string; token: string }): Promise<void> {
  const { to, token } = params;
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;
  const subject = "Verify your email for PlotGhost";
  const html = wrapperHtml(`
    <h1 style="font-size: 20px; margin-bottom: 16px;">Verify your email</h1>
    <p style="font-size: 15px; line-height: 1.6;">Welcome to PlotGhost! Please confirm this is your email address to finish setting up your account.</p>
    <p style="margin: 24px 0;">
      <a href="${verifyUrl}" style="background: #111; color: #fff; padding: 12px 20px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">Verify email</a>
    </p>
  `);
  await send(to, subject, html);
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
