import { storage } from "./storage";
import { randomBytes } from "crypto";
import { hashPassword } from "./auth";

/**
 * 기본 사용자와 초대 코드를 생성하는 스크립트
 */
export async function createInitialData() {
  // 기본 사용자 생성 (admin)
  const hashedPassword = await hashPassword("password123");
  
  let adminUser;
  try {
    adminUser = await storage.getUserByUsername("admin");
    if (!adminUser) {
      adminUser = await storage.createUser({
        username: "admin",
        password: hashedPassword,
        name: "관리자",
        email: "admin@example.com",
        avatar: "👤",
        googleApiKey: null
      });
      console.log("관리자 계정 생성 완료:", adminUser.username);
    } else {
      console.log("관리자 계정이 이미 존재합니다:", adminUser.username);
    }
  } catch (error) {
    console.error("관리자 계정 생성 오류:", error);
    return;
  }
  
  // 기본 초대 코드 생성
  const code = "WELCOME" + randomBytes(3).toString("hex").toUpperCase();
  
  try {
    // 7일 후 만료
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // 초대 코드가 이미 존재하는지 확인
    const existingCodes = await storage.getUserInviteCodes(adminUser.id);
    
    if (existingCodes.length === 0) {
      const inviteCode = await storage.createInviteCode({
        code,
        createdBy: adminUser.id,
        expiresAt
      });
      
      console.log("초대 코드 생성 완료:", inviteCode.code);
      console.log("이 코드로 회원가입할 수 있습니다.");
    } else {
      console.log("이미 생성된 초대 코드가 있습니다:", existingCodes[0].code);
    }
  } catch (error) {
    console.error("초대 코드 생성 오류:", error);
  }
}