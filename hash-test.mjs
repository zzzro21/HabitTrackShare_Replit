// 비밀번호 해싱 테스트
import bcrypt from 'bcryptjs';

async function main() {
  const password = 'password123';
  
  // 해시 생성
  console.log(`\n===== 비밀번호 해싱 테스트: ${password} =====`);
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(`생성된 해시: ${hash}`);
  
  // 해시 검증
  console.log(`\n===== 비밀번호 검증 테스트 =====`);
  const isValid = await bcrypt.compare(password, hash);
  console.log(`올바른 비밀번호 검증: ${isValid ? '성공' : '실패'}`);
  
  const wrongPassword = 'wrongpassword';
  const isInvalid = await bcrypt.compare(wrongPassword, hash);
  console.log(`잘못된 비밀번호 검증: ${isInvalid ? '성공' : '실패'}`);
  
  // 서버 로그에서 가져온 해시 검증
  console.log(`\n===== 서버 해시 검증 테스트 =====`);
  const serverHash = '$2b$10$19Gj0rJa07ZKG0Vl5y1lGeQnxK4UpYGCuOqZcFvTwQpy71XVC5oZi';
  const serverValid = await bcrypt.compare(password, serverHash);
  console.log(`서버 해시 검증: ${serverValid ? '성공' : '실패'}`);
}

main().catch(console.error);