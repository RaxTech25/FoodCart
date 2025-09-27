import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { getCurrentUserId } from '@lib/auth';

export const runtime = 'nodejs';

export async function POST() {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const partner = await prisma.partnerProfile.findUnique({ where: { userId }, include: { sessions: true } });
    if (!partner) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Find latest open session (logoutAt null)
    const session = await prisma.partnerLoginSession.findFirst({
      where: { partnerId: partner.id, logoutAt: null },
      orderBy: { loginAt: 'desc' },
    });

    if (!session) {
      await prisma.user.update({ where: { id: userId }, data: { online: false } });
      return NextResponse.json({ ok: true });
    }

    const logoutAt = new Date();
    const totalMinutes = Math.round((logoutAt.getTime() - session.loginAt.getTime()) / (60 * 1000));

    await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { online: false } }),
      prisma.partnerLoginSession.update({ where: { id: session.id }, data: { logoutAt, totalMinutes } }),
    ]);

    return NextResponse.json({ ok: true, totalMinutes });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}