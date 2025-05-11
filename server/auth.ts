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
  try {
    console.log(`비밀번호 검증 시도 - 해시길이: ${hashedPassword.length}`);
    const result = await bcrypt.compare(plainPassword, hashedPassword);
    console.log(`비밀번호 비교 결과: ${result}`);
    return result;
  } catch (error) {
    console.error('비밀번호 검증 오류:', error);
    return false;
  }
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
    console.log("현재 로그인된 사용자 없음: 세션에 userId 없음");
    return null;
  }

  console.log("현재 로그인된 사용자 ID 조회 시도:", userId);

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

    if (user) {
      console.log("사용자 정보 조회 성공:", user.username, user.id);
    } else {
      console.log("DB에서 사용자 정보를 찾을 수 없음:", userId);
    }

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