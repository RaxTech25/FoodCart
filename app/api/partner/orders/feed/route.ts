import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { getCurrentUserId } from '@lib/auth';
import { haversineDistanceKm } from '@lib/util';

export const runtime = 'nodejs';

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const partner = await prisma.partnerProfile.findUnique({
    where: { userId },
    include: { user: true }
  });
  if (!partner || partner.approvalStatus !== 'APPROVED' || !partner.kitReceived) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (!partner.user.lat || !partner.user.lng) {
    return NextResponse.json({ error: 'Partner not online' }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: { status: 'VENDOR_ACCEPTED', partnerId: null },
    include: { vendor: { include: { shop: true, user: true } } },
    orderBy: { acceptedAt: 'desc' }
  });

  const withinRadius = orders.filter(o => {
    const shop = o.vendor.shop;
    const vUser = o.vendor.user;
    const lat = shop?.lat ?? vUser.lat;
    const lng = shop?.lng ?? vUser.lng;
    if (lat == null || lng == null) return false;
    const dist = haversineDistanceKm(partner.user.lat!, partner.user.lng!, lat, lng);
    return dist <= (partner.radiusKm || 5);
  });

  return NextResponse.json({ orders: withinRadius });
}