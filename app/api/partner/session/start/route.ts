import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { getCurrentUserId } from '@lib/auth';
import { haversineDistanceKm } from '@lib/util';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const partner = await prisma.partnerProfile.findUnique({ where: { userId }, include: { user: true } });
    if (!partner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (partner.approvalStatus !== 'APPROVED' || !partner.kitReceived) {
      return NextResponse.json({ error: 'Partner not approved or kit not received' }, { status: 403 });
    }

    const { lat, lng } = await req.json();
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
    }

    if (partner.loginLat == null || partner.loginLng == null) {
      return NextResponse.json({ error: 'No registered region set' }, { status: 400 });
    }

    const dist = haversineDistanceKm(lat, lng, partner.loginLat, partner.loginLng);
    if (dist > (partner.radiusKm || 5)) {
      return NextResponse.json({ error: `Outside registered region (${dist.toFixed(2)} km)` }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { online: true, lat, lng } }),
      prisma.partnerLoginSession.create({ data: { partnerId: partner.id } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}