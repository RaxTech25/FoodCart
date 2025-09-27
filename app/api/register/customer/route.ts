import { NextResponse } from 'next/server';
import { prisma } from '@lib/prisma';
import { hashPassword } from '@lib/auth';

export const runtime = 'nodejs';

function generateCustomerId() {
  return 'CUST-' + Math.floor(100000 + Math.random() * 900000);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, mobile, gender, email, password } = body;

    if (!name || !mobile || !gender || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const customerId = generateCustomerId();
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        username: customerId,
        passwordHash,
        role: 'CUSTOMER',
        phone: mobile,
        email,
        firstLoginOtpRequired: true,
        customer: {
          create: {}
        }
      },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'WELCOME',
        content: `Welcome! Your Customer ID is ${customerId}.`
      }
    });

    return NextResponse.json({ ok: true, customerId });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}