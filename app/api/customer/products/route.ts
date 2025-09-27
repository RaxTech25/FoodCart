import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true, vendor: { approvalStatus: 'APPROVED' } },
    orderBy: { createdAt: 'desc' },
    include: { vendor: true },
  });
  return NextResponse.json({ products });
}