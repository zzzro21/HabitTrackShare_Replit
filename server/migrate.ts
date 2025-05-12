import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./db";

// 데이터베이스에 테이블 생성
async function main() {
  console.log("데이터베이스 마이그레이션 시작...");
  
  try {
    // 기존 테이블 삭제 (주의: 모든 데이터가 삭제됩니다)
    console.log("기존 테이블 삭제 중...");
    await db.execute(`
      DROP TABLE IF EXISTS habit_insights;
      DROP TABLE IF EXISTS daily_feedbacks;
      DROP TABLE IF EXISTS habit_notes;
      DROP TABLE IF EXISTS habit_entries;
      DROP TABLE IF EXISTS habits;
      DROP TABLE IF EXISTS users;
    `);
    
    console.log("새로운 스키마로 테이블 생성 중...");
    // PostgreSQL 스키마를 데이터베이스에 적용합니다.
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        avatar VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL DEFAULT 'user@example.com',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS habits (
        id SERIAL PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        score_type VARCHAR(50) NOT NULL,
        score_value INTEGER NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS habit_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        habit_id INTEGER NOT NULL REFERENCES habits(id),
        day INTEGER NOT NULL,
        value INTEGER NOT NULL,
        UNIQUE(user_id, habit_id, day)
      );
      
      CREATE TABLE IF NOT EXISTS habit_notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        habit_id INTEGER NOT NULL REFERENCES habits(id),
        day INTEGER NOT NULL,
        note TEXT NOT NULL,
        UNIQUE(user_id, habit_id, day)
      );
      
      CREATE TABLE IF NOT EXISTS daily_feedbacks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        day INTEGER NOT NULL,
        feedback TEXT NOT NULL,
        UNIQUE(user_id, day)
      );
      
      CREATE TABLE IF NOT EXISTS habit_insights (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        summary TEXT NOT NULL,
        strengths TEXT[] NOT NULL,
        improvement_areas TEXT[] NOT NULL,
        recommendations TEXT[] NOT NULL,
        date TIMESTAMP NOT NULL
      );
    `);
    
    console.log("데이터베이스 마이그레이션 완료!");
    
  } catch (error) {
    console.error("마이그레이션 중 오류 발생:", error);
  } finally {
    process.exit(0);
  }
}

main();