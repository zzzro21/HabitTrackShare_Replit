import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// 세션 저장소 설정
// 인메모리 세션 저장소 사용 - 데이터베이스 연결 오류 때문에 변경함
import MemoryStore from 'memorystore';
const MemoryStoreSession = MemoryStore(session);

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 1주일

export const sessionMiddleware = session({
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // 24시간마다 만료된 세션 정리
  }),
  secret: process.env.SESSION_SECRET || 'habit-tracker-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: COOKIE_MAX_AGE, 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // 프로덕션 환경에서만 secure 쿠키 사용
    sameSite: 'lax' // sameSite lax 사용
  }
});

// 로그인 처리 함수
export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: '사용자 이름과 비밀번호를 입력해주세요.' });
    }
    
    // 사용자 조회
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    
    if (!user) {
      return res.status(401).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 간단한 비밀번호 검증 (실제로는 bcrypt 등을 사용하여 해시된 비밀번호를 비교해야 함)
    if (user.password !== password) {
      return res.status(401).json({ message: '비밀번호가 일치하지 않습니다.' });
    }
    
    // 세션에 사용자 정보 저장
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.name = user.name;
    
    // 응답 헤더 설정
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    
    // 민감한 정보를 제외한 사용자 정보 반환
    const userData = {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar
    };
    
    res.status(200).json({ message: '로그인 성공', user: userData });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}

// 로그아웃 처리 함수
export function logout(req: Request, res: Response) {
  req.session.destroy((err) => {
    if (err) {
      console.error('로그아웃 오류:', err);
      return res.status(500).json({ message: '로그아웃 중 오류가 발생했습니다.' });
    }
    
    res.clearCookie('connect.sid');
    res.status(200).json({ message: '로그아웃 성공' });
  });
}

// 현재 로그인한 사용자 정보 조회
export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ message: '로그인이 필요합니다.' });
    }
    
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, req.session.userId));
    
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 민감한 정보를 제외한 사용자 정보 반환
    const userData = {
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar
    };
    
    res.status(200).json(userData);
  } catch (error) {
    console.error('사용자 정보 조회 오류:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
}

// 인증 확인 미들웨어
export function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  // 개발 모드에서는 인증 우회 (데모 목적)
  if (process.env.NODE_ENV === 'development') {
    console.log('개발 모드: 인증 우회');
    req.session.userId = 6; // 김유나 ID (기본 사용자)
    req.session.username = 'zzzro';
    req.session.name = '김유나';
    return next();
  }
  
  if (req.session.userId) {
    return next();
  }
  
  res.status(401).json({ message: '로그인이 필요합니다.' });
}

// 자신의 데이터만 수정할 수 있도록 하는 미들웨어
export function onlySelfModify(req: Request, res: Response, next: NextFunction) {
  // 개발 모드에서는 인증 우회 (데모 목적)
  if (process.env.NODE_ENV === 'development') {
    console.log('개발 모드: 권한 체크 우회');
    return next();
  }

  if (!req.session.userId) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }

  // userId가 있는지 확인하고 현재 로그인한 사용자와 일치하는지 확인
  const userId = 
    req.body.userId || 
    (req.params.userId ? parseInt(req.params.userId) : null);
  
  if (!userId) {
    return res.status(400).json({ message: '사용자 ID가 필요합니다.' });
  }
  
  if (userId !== req.session.userId) {
    return res.status(403).json({ 
      message: '접근 권한이 없습니다. 자신의 데이터만 수정할 수 있습니다.',
      attemptedUserId: userId,
      yourUserId: req.session.userId
    });
  }
  
  next();
}

// 피드백은 친구의 데이터에도 작성할 수 있도록 하는 미들웨어
export function allowFeedbackForAny(req: Request, res: Response, next: NextFunction) {
  // 개발 모드에서는 인증 우회 (데모 목적)
  if (process.env.NODE_ENV === 'development') {
    console.log('개발 모드: 피드백 권한 체크 우회');
    return next();
  }

  if (!req.session.userId) {
    return res.status(401).json({ message: '로그인이 필요합니다.' });
  }
  
  // 피드백은 모든 사용자에게 작성 가능
  next();
}

// 로그인 여부 확인
export function checkAuthStatus(req: Request, res: Response) {
  if (req.session.userId) {
    res.status(200).json({ 
      isAuthenticated: true, 
      user: {
        id: req.session.userId,
        name: req.session.name,
        username: req.session.username
      }
    });
  } else {
    res.status(200).json({ isAuthenticated: false });
  }
}

// 사용자 세션 정보 타입 정의 확장
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
    name: string;
  }
}