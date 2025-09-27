import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { getCurrentUserId } from '@lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const partner = await prisma.partnerProfile.findUnique({ where: { userId }, include: { user: true } });
    if (!partner || partner.approvalStatus !== 'APPROVED' || !partner.kitReceived || !partner.user.online) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { vendor: { include: { shop: true, user: true } }, assignment: true }
    });
    if (!order || order.status !== 'VENDOR_ACCEPTED' || order.partnerId) {
      return NextResponse.json({ error: 'Order not available' }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'PARTNER_ASSIGNED',
        partnerId: partner.id,
        assignment: { create: { partnerId: partner.id } }
      },
      include: { assignment: true }
    });

    await prisma.notification.create({ data: { userId: userId, type: 'ORDER', content: `Order ${orderId} claimed.` } });

    return NextResponse.json({ ok: true, order: updated });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}