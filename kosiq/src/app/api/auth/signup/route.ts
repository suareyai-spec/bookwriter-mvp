import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { randomBytes } from 'crypto';

const ADMIN_EMAILS = ['suarey@gmail.com', 'suareyai@gmail.com'];

function generateInviteCode(): string {
  return randomBytes(4).toString('hex').toUpperCase().slice(0, 8);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { firstName, lastName, email, password, role, phone, joinMethod, orgCode, orgName, orgType, orgNpi } = body;

  // Validate required fields
  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json({ error: 'First name, last name, email, and password are required' }, { status: 400 });
  }
  if (!role) {
    return NextResponse.json({ error: 'Please select a role' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  // Check if email exists
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 12);
  const name = `${firstName.trim()} ${lastName.trim()}`;
  const isSuperAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

  let organizationId: string | undefined;

  if (joinMethod === 'join' && orgCode) {
    // Find org by invite code
    const org = await prisma.organization.findFirst({
      where: { inviteCode: orgCode.toUpperCase() },
    });
    if (!org) {
      return NextResponse.json({ error: 'Invalid organization code. Please check with your admin.' }, { status: 400 });
    }
    organizationId = org.id;
  } else if (joinMethod === 'create' && orgName) {
    // Create new organization
    const inviteCode = generateInviteCode();
    const org = await prisma.organization.create({
      data: {
        name: orgName.trim(),
        type: orgType || 'provider',
        npi: orgNpi || null,
        inviteCode,
      },
    });
    organizationId = org.id;
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      passwordHash,
      name,
      role: role || 'admin',
      systemRole: isSuperAdmin ? 'superadmin' : 'user',
      phone: phone || null,
      organizationId: organizationId || null,
    },
  });

  // If user created an org, add them as owner in OrganizationMember
  if (joinMethod === 'create' && organizationId) {
    await prisma.organizationMember.create({
      data: {
        organizationId,
        userId: user.id,
        role: 'owner',
        productAccess: JSON.stringify(['atlasiq', 'chartiq', 'cliniq', 'risk-engine', 'quality', 'care-management', 'rpm', 'behavioral-health', 'cost-explorer', 'payer-analytics', 'bridgeiq']),
      },
    });
  } else if (joinMethod === 'join' && organizationId) {
    // Add as member with default access
    await prisma.organizationMember.create({
      data: {
        organizationId,
        userId: user.id,
        role: 'member',
        productAccess: JSON.stringify([]),
      },
    });
  }

  return NextResponse.json({ ok: true });
}
