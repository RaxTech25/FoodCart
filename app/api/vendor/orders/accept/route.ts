import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { getCurrentUserId } from '@lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId }, include: { vendor: true } });
    if (!user || user.role !== 'VENDOR' || !user.vendor) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing order id' }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id }, include: { vendor: true } });
    if (!order || order.vendorId !== user.vendor.id) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (order.status !== 'PENDING') return NextResponse.json({ error: 'Order not pending' }, { status: 400 });
    if (order.expiresAt && order.expiresAt < new Date()) {
      await prisma.order.update({ where: { id }, data: { status: 'AUTO_REJECTED' } });
      return NextResponse.json({ error: 'Order expired' }, { status: 400 });
    }

    // Find nearest approved partner (simple strategy: first approved & kitReceived)
    const partner = await prisma.partnerProfile.findFirst({
      where: { approvalStatus: 'APPROVED', kitReceived: true },
      include: { user: true }
    });

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'VENDOR_ACCEPTED',
        acceptedAt: new Date(),
        partnerId: partner?.id,
        assignment: partner ? {
          create: { partnerId: partner.id }
        } : undefined
      },
      include: { assignment: true }
    });

    // Notify (stubs)
    await prisma.notification.create({ data: { userId: user.id, type: 'ORDER', content: `Order ${id} accepted.` } });

    return NextResponse.json({ ok: true, order: updated });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}