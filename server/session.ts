import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { pool } from './db';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// 일주일 동안 세션 유지
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export function setupSession() {
  const PgSession = connectPgSimple(session);

  // 세션 테이블이 없으면 생성
  pool.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
    );
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
  `).catch(err => {
    console.error('Error creating session table:', err);
  });

  return session({
    store: new PgSession({
      pool,
      tableName: 'session',
      createTableIfMissing: true,
    }),
    name: 'habit_tracker_sid',
    secret: process.env.SESSION_SECRET || 'session_secret_dev_only',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: ONE_WEEK,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    }
  });
}