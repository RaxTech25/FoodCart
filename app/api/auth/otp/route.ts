import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { setSessionCookie } from '@lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { username, otp } = await req.json();
    if (!username || !otp) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return NextResponse.json({ error: 'Invalid user' }, { status: 404 });

    const record = await prisma.oTP.findFirst({
      where: { userId: user.id, code: otp, used: false },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP expired' }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.oTP.update({ where: { id: record.id }, data: { used: true } }),
      prisma.user.update({ where: { id: user.id }, data: { firstLoginOtpRequired: false } }),
    ]);

    const res = NextResponse.json({ redirect: roleRedirect(user.role) });
    setSessionCookie(res, user.id);
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

function roleRedirect(role: string) {
  switch (role) {
    case 'ADMIN': return '/admin';
    case 'STAFF': return '/staff';
    case 'VENDOR': return '/vendor';
    case 'PARTNER': return '/partner';
    case 'CUSTOMER': return '/customer';
    default: return '/';
  }
}