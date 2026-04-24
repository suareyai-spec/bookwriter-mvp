import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const [
    todayAppointments,
    totalPatients,
    pendingOrders,
    unreadMessages,
    recentEncounters,
    upcomingAppointments,
    claimStats,
  ] = await Promise.all([
    prisma.coreAppointment.findMany({
      where: { date: { gte: todayStart, lt: todayEnd } },
      include: { patient: { select: { firstName: true, lastName: true, mrn: true } } },
      orderBy: { time: 'asc' },
    }),
    prisma.corePatient.count({ where: { status: 'Active' } }),
    prisma.coreLabOrder.count({ where: { status: { in: ['Ordered', 'Collected', 'Processing'] } } }),
    prisma.coreMessage.count({ where: { read: false, toRole: 'Provider' } }),
    prisma.coreEncounter.findMany({
      take: 10,
      orderBy: { date: 'desc' },
      include: { patient: { select: { firstName: true, lastName: true, mrn: true } } },
    }),
    prisma.coreAppointment.findMany({
      where: { date: { gte: now }, status: 'Scheduled' },
      take: 10,
      orderBy: { date: 'asc' },
      include: { patient: { select: { firstName: true, lastName: true, mrn: true } } },
    }),
    prisma.coreClaim.groupBy({
      by: ['status'],
      _sum: { totalCharge: true, paidAmount: true },
      _count: true,
    }),
  ]);

  const patientsSeenToday = todayAppointments.filter(a => a.status === 'Completed').length;

  return NextResponse.json({
    todayAppointments,
    patientsSeenToday,
    totalPatients,
    pendingOrders,
    unreadMessages,
    upcomingCount: upcomingAppointments.length,
    recentEncounters,
    upcomingAppointments,
    claimStats,
  });
}
