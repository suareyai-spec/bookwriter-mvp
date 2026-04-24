import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import prisma from './prisma';

export type Role = "admin" | "cmo" | "analyst" | "viewer";

export const PERMISSIONS: Record<Role, string[]> = {
  admin: ["*"],
  cmo: ["view_dashboard", "view_patients", "view_analytics", "view_reports", "generate_reports", "view_ens", "export_data", "manage_users", "upload_claims"],
  analyst: ["view_dashboard", "view_patients", "view_analytics", "view_reports", "view_ens", "export_data", "upload_claims"],
  viewer: ["view_dashboard", "view_patients", "view_analytics", "view_reports", "view_ens"],
};

export function hasPermission(role: Role, permission: string): boolean {
  const perms = PERMISSIONS[role];
  if (!perms) return false;
  return perms.includes("*") || perms.includes(permission);
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  organizationId: string | null;
}

export async function getAuthUser(): Promise<AuthenticatedUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  if ((session as any).expired) {
    throw new AuthError('Session expired', 401, 'SESSION_EXPIRED');
  }
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role as Role,
    organizationId: user.organizationId,
  };
}

export async function requireAuth(permission?: string): Promise<AuthenticatedUser> {
  const user = await getAuthUser();
  if (!user) throw new AuthError('Unauthorized', 401);
  if (permission && !hasPermission(user.role, permission)) {
    throw new AuthError('Forbidden', 403);
  }
  return user;
}

export class AuthError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function handleAuthError(error: unknown) {
  if (error instanceof AuthError) {
    const body: any = { error: error.message };
    if (error.code) body.code = error.code;
    return NextResponse.json(body, { status: error.status });
  }
  console.error(error);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

// ── RBAC / Product Access ──

const SUPERADMIN_EMAILS = ['suarey@gmail.com', 'suareyai@gmail.com'];

export function isSuperadminEmail(email: string): boolean {
  return SUPERADMIN_EMAILS.includes(email.toLowerCase());
}

export const PRODUCT_BUNDLES = {
  provider: ['pophealth', 'chartiq', 'quality', 'care-management', 'rpm', 'cliniq', 'behavioral-health'],
  payer: ['risk-engine', 'cost-explorer', 'payer-analytics', 'pophealth', 'bridgeiq'],
  enterprise: ['pophealth', 'cliniq', 'risk-engine', 'quality', 'care-management', 'rpm', 'behavioral-health', 'cost-explorer', 'payer-analytics', 'bridgeiq', 'chartiq'],
} as const;

export async function getUserProductAccess(userId: string, email: string): Promise<string[] | 'all'> {
  if (isSuperadminEmail(email)) return 'all';

  const memberships = await prisma.organizationMember.findMany({ where: { userId } });
  if (memberships.length === 0) return [];

  const allProducts = new Set<string>();
  for (const m of memberships) {
    try {
      const products = JSON.parse(m.productAccess) as string[];
      products.forEach(p => allProducts.add(p));
    } catch {}
  }

  return Array.from(allProducts);
}
