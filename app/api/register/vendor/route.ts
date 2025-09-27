import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { hashPassword } from '@lib/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { shopType, groceryType, vegetarian, website, ownerName, email, mobile, bankAccount, bankIfsc } = body;

    if (!shopType || !ownerName || !mobile || !bankAccount || !bankIfsc) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a user with random password; credentials will be shared after approval
    const passwordHash = await hashPassword(Math.random().toString(36));
    const user = await prisma.user.create({
      data: {
        username: `PENDING-VENDOR-${Date.now()}`, // will be replaced on approval
        passwordHash,
        role: 'VENDOR',
        phone: mobile,
        email,
        firstLoginOtpRequired: true,
        vendor: {
          create: {
            shopType,
            groceryType,
            vegetarian: !!vegetarian,
            website,
            bankAccount,
            bankIfsc,
            approvalStatus: 'PENDING',
          }
        }
      },
      include: { vendor: true }
    });

    // Notify (stub)
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'REGISTRATION',
        content: 'Vendor registration received. Verification may take up to 24 hours.'
      }
    });

    return NextResponse.json({ ok: true, vendorId: user.vendor?.id });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}