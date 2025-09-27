import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { getCurrentUserId } from '@lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId }, include: { vendor: true } });
  if (!user || user.role !== 'VENDOR' || !user.vendor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Auto-expire pending orders
  await prisma.order.updateMany({
    where: {
      vendorId: user.vendor.id,
      status: 'PENDING',
      expiresAt: { lt: new Date() },
    },
    data: { status: 'AUTO_REJECTED' }
  });

  const orders = await prisma.order.findMany({
    where: { vendorId: user.vendor.id },
    orderBy: { createdAt: 'desc' }
  });

  return NextResponse.json({ orders });
}