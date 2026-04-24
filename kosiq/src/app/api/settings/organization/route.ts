import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user?.organizationId) return NextResponse.json({ org: null, members: [] });

  const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
  const members = await prisma.organizationMember.findMany({
    where: { organizationId: user.organizationId },
    include: { user: { select: { id: true, email: true, name: true, systemRole: true } } },
  });

  return NextResponse.json({ org, members });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { memberId, role, productAccess, action, email, orgName, orgType } = body;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Create org if needed
  if (action === 'create-org') {
    const org = await prisma.organization.create({
      data: { name: orgName, type: orgType },
    });
    await prisma.user.update({ where: { id: user.id }, data: { organizationId: org.id } });
    await prisma.organizationMember.create({
      data: { organizationId: org.id, userId: user.id, role: 'owner', productAccess: JSON.stringify(productAccess || []) },
    });
    return NextResponse.json({ success: true, org });
  }

  if (!user.organizationId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

  // Update member
  if (action === 'update-member' && memberId) {
    await prisma.organizationMember.update({
      where: { id: memberId },
      data: {
        ...(role && { role }),
        ...(productAccess && { productAccess: JSON.stringify(productAccess) }),
      },
    });
    return NextResponse.json({ success: true });
  }

  // Invite member
  if (action === 'invite' && email) {
    let invitee = await prisma.user.findUnique({ where: { email } });
    if (!invitee) return NextResponse.json({ error: 'User not found. They must sign up first.' }, { status: 404 });

    await prisma.user.update({ where: { id: invitee.id }, data: { organizationId: user.organizationId } });
    await prisma.organizationMember.upsert({
      where: { organizationId_userId: { organizationId: user.organizationId, userId: invitee.id } },
      update: { role: role || 'member', productAccess: JSON.stringify(productAccess || []) },
      create: { organizationId: user.organizationId, userId: invitee.id, role: role || 'member', productAccess: JSON.stringify(productAccess || []) },
    });
    return NextResponse.json({ success: true });
  }

  // Remove member
  if (action === 'remove' && memberId) {
    const member = await prisma.organizationMember.findUnique({ where: { id: memberId } });
    if (member) {
      await prisma.organizationMember.delete({ where: { id: memberId } });
      await prisma.user.update({ where: { id: member.userId }, data: { organizationId: null } });
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
