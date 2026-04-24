import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim();
  if (!q) return NextResponse.json([]);

  // Search CorePatient first
  const corePatients = await prisma.corePatient.findMany({
    where: {
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { mrn: { contains: q } },
      ],
    },
    take: 10,
    orderBy: { lastName: 'asc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dateOfBirth: true,
      gender: true,
      mrn: true,
      insuranceName: true,
      status: true,
    },
  });

  if (corePatients.length > 0) {
    return NextResponse.json(
      corePatients.map((p) => ({
        id: p.id,
        firstName: p.firstName,
        lastName: p.lastName,
        dob: p.dateOfBirth,
        gender: p.gender,
        mrn: p.mrn,
        insurance: p.insuranceName || '',
        source: 'core',
      }))
    );
  }

  // Fallback to Patient table (AtlasIQ seed data)
  const patients = await prisma.patient.findMany({
    where: {
      OR: [
        { firstName: { contains: q } },
        { lastName: { contains: q } },
        { externalId: { contains: q } },
      ],
    },
    take: 10,
    orderBy: { lastName: 'asc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      dob: true,
      gender: true,
      externalId: true,
      primaryPayer: true,
    },
  });

  return NextResponse.json(
    patients.map((p) => ({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      dob: p.dob,
      gender: p.gender,
      mrn: p.externalId,
      insurance: p.primaryPayer || '',
      source: 'atlas',
    }))
  );
}
