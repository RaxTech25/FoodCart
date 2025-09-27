import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { hashPassword } from '@lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vehicleType, email, mobile, bankAccount, bankIfsc, loginLat, loginLng } = body;

    if (!vehicleType || !mobile || !bankAccount || !bankIfsc) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const passwordHash = await hashPassword(Math.random().toString(36));
    const user = await prisma.user.create({
      data: {
        username: `PENDING-PARTNER-${Date.now()}`,
        passwordHash,
        role: 'PARTNER',
        phone: mobile,
        email,
        firstLoginOtpRequired: true,
        partner: {
          create: {
            vehicleType,
            bankAccount,
            bankIfsc,
            loginLat,
            loginLng,
            approvalStatus: 'PENDING',
            kitShipped: false,
            kitReceived: false,
          }
        }
      },
      include: { partner: true }
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'REGISTRATION',
        content: 'Partner registration received. Verification may take up to 24 hours.'
      }
    });

    return NextResponse.json({ ok: true, partnerId: user.partner?.id });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}