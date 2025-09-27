import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { verifyPassword, createOtp, setSessionCookie } from '@lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { username }, include: { vendor: true, partner: true } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }
    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    // Gate login for Vendor/Partner until approved by Staff
    if (user.role === 'VENDOR') {
      if (!user.vendor || user.vendor.approvalStatus !== 'APPROVED') {
        return NextResponse.json({ error: 'Vendor approval pending or rejected' }, { status: 403 });
      }
    }
    if (user.role === 'PARTNER') {
      if (!user.partner || user.partner.approvalStatus !== 'APPROVED' || !user.partner.kitReceived) {
        return NextResponse.json({ error: 'Partner approval pending or kit not received' }, { status: 403 });
      }
    }

    if (user.firstLoginOtpRequired) {
      await createOtp(user.id);
      return NextResponse.json({ requireOtp: true });
    }

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