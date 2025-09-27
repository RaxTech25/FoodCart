import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const id = Number(form.get('id'));
    if (!id) return NextResponse.json({ error: 'Missing partner id' }, { status: 400 });

    const partner = await prisma.partnerProfile.update({
      where: { id },
      data: { kitReceived: true },
    });

    await prisma.notification.create({
      data: { userId: partner.userId, type: 'KIT', content: 'Delivery kit received. You can start rides.' }
    });

    return NextResponse.redirect(new URL('/staff', req.url));
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}