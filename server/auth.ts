import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import { db } from './db';
import { users } from '../shared/schema';
import { eq } from 'drizzle-orm';

// 비밀번호 해싱 함수
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// 비밀번호 검증 함수
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// 인증 미들웨어
export function authenticateUser(req: Request, res: Response, next: NextFunction) {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: '로그인이 필요합니다.'
    });
  }
  next();
}

// 현재 로그인한 사용자 정보 조회
export async function getCurrentUser(req: Request) {
  const userId = req.session.userId;
  if (!userId) {
    return null;
  }

  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        avatar: users.avatar,
        googleApiKey: users.googleApiKey
      })
      .from(users)
      .where(eq(users.id, userId));

    return user || null;
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    return null;
  }
}

// 세션에서 사용자 ID 가져오기
export function getUserIdFromSession(req: Request): number | null {
  return req.session.userId || null;
}