import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey, event } = body;

    if (!apiKey || !event) {
      return NextResponse.json({ error: 'Missing apiKey or event' }, { status: 400 });
    }

    // 1. Validate API key → find organization
    const org = await prisma.organization.findUnique({ where: { apiKey } });
    if (!org) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const { type, patientId, patientName, dob, hospitalName, admitDate, dischargeDate, diagnosis, admissionType } = event;

    if (!type || !patientName || !dob || !hospitalName) {
      return NextResponse.json({ error: 'Missing required event fields: type, patientName, dob, hospitalName' }, { status: 400 });
    }

    // 2. Match patient by externalId or name+dob
    let patient = null;
    if (patientId) {
      patient = await prisma.patient.findFirst({
        where: { externalId: patientId, organizationId: org.id },
      });
    }
    if (!patient) {
      const nameParts = patientName.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || nameParts[0];
      const dobDate = new Date(dob);
      
      patient = await prisma.patient.findFirst({
        where: {
          organizationId: org.id,
          firstName: { equals: firstName },
          lastName: { equals: lastName },
          dob: {
            gte: new Date(dobDate.getFullYear(), dobDate.getMonth(), dobDate.getDate()),
            lt: new Date(dobDate.getFullYear(), dobDate.getMonth(), dobDate.getDate() + 1),
          },
        },
      });
    }

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found in organization' }, { status: 404 });
    }

    // 3. Create ENSEvent record
    const ensEvent = await prisma.eNSEvent.create({
      data: {
        patientId: patient.id,
        hospitalName,
        admissionType: admissionType || type,
        admitDate: admitDate ? new Date(admitDate) : new Date(),
        dischargeDate: dischargeDate ? new Date(dischargeDate) : null,
        diagnosis: diagnosis || null,
        status: type === 'discharge' ? 'discharged' : 'admitted',
        organizationId: org.id,
      },
    });

    // 4. Check if high-risk
    const isHighRisk = patient.riskScore >= 70;

    return NextResponse.json({
      success: true,
      eventId: ensEvent.id,
      highRisk: isHighRisk,
      ...(isHighRisk && { alert: 'HIGH RISK PATIENT - Immediate attention recommended' }),
    });
  } catch (error) {
    console.error('ENS webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
