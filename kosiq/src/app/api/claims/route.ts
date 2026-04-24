import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const claims = await prisma.claim.findMany();

  const totalCount = claims.length;
  const totalAmount = claims.reduce((s, c) => s + c.amount, 0);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const byMonthMap: Record<string, number> = {};
  claims.forEach(c => {
    const m = monthNames[c.claimDate.getMonth()];
    byMonthMap[m] = (byMonthMap[m] || 0) + c.amount;
  });
  const byMonth = monthNames.map(m => ({ month: m, amount: Math.round((byMonthMap[m] || 0) / 1000) }));

  // By expense type
  const expCount: Record<string, number> = {};
  const expCost: Record<string, number> = {};
  claims.forEach(c => {
    expCount[c.expenseType] = (expCount[c.expenseType] || 0) + 1;
    expCost[c.expenseType] = (expCost[c.expenseType] || 0) + c.amount;
  });
  const byExpenseCount = Object.entries(expCount).map(([name, value]) => ({ name, value }));
  const byExpenseCost = Object.entries(expCost).map(([name, value]) => ({ name, value: Math.round(value) }));

  // By payor
  const payorMap: Record<string, number> = {};
  claims.forEach(c => { payorMap[c.payer] = (payorMap[c.payer] || 0) + c.amount; });
  const byPayor = Object.entries(payorMap)
    .map(([payor, amount]) => ({ payor, amount: Math.round(amount / 1000) }))
    .sort((a, b) => b.amount - a.amount);

  return NextResponse.json({
    totalCount,
    totalAmount: Math.round(totalAmount),
    byMonth,
    byExpenseCount,
    byExpenseCost,
    byPayor,
  });
}
