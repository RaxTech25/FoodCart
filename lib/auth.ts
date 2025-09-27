import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createOtp(userId: number) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await prisma.oTP.create({
    data: { userId, code, expiresAt },
  });
  // TODO: integrate SMS/Email provider here
  return code;
}

export function setSessionCookie(res: NextResponse, userId: number) {
  res.cookies.set('session_user_id', String(userId), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function getCurrentUserId(req?: NextRequest): Promise<number | null> {
  const cookieStore = req ? req.cookies : cookies();
  const val = cookieStore.get('session_user_id')?.value;
  if (!val) return null;
  const id = parseInt(val, 10);
  return Number.isNaN(id) ? null : id;
}