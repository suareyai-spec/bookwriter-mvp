import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sig = await prisma.signature.findUnique({ where: { id: params.id } });
  if (!sig || sig.userId !== (session.user as any).id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(sig);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const sig = await prisma.signature.findUnique({ where: { id: params.id } });
  if (!sig || sig.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  const body = await req.json();
  const updated = await prisma.signature.update({
    where: { id: params.id },
    data: {
      name: body.name ?? sig.name,
      template: body.template ?? sig.template,
      data: body.data ? (typeof body.data === 'string' ? body.data : JSON.stringify(body.data)) : sig.data,
      isDefault: body.isDefault ?? sig.isDefault,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const sig = await prisma.signature.findUnique({ where: { id: params.id } });
  if (!sig || sig.userId !== userId) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  await prisma.signature.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
