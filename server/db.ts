import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';

// 데이터베이스 연결 풀 생성
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Drizzle ORM 인스턴스 생성
export const db = drizzle(pool, { schema });

// 데이터베이스 연결 테스트 함수
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    console.log('[database] Connection successful:', new Date().toISOString());
    client.release();
    return true;
  } catch (error) {
    console.error('[database] Connection failed:', error);
    return false;
  }
}