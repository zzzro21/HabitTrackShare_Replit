// 최신 서버 해시 검증 테스트
import bcrypt from 'bcryptjs';

async function main() {
  const password = 'password123';
  
  // 서버 로그에서 가져온 최신 해시 검증
  console.log(`\n===== 서버 해시 검증 테스트 =====`);
  const serverHash = '$2b$10$7G61EJK.eQQjSNGLKYrYcuhQz5xgR9hJ8X0U1LHBvRRB8MwRJf8lK'; // 가장 최근 서버 로그에서 확인한 해시
  console.log(`입력 비밀번호: ${password}`);
  console.log(`서버 해시: ${serverHash}`);
  
  const serverValid = await bcrypt.compare(password, serverHash);
  console.log(`서버 해시 검증 결과: ${serverValid ? '성공 ✅' : '실패 ❌'}`);
  
  // 직접 새로 생성한 해시로도 테스트
  const newHash = await bcrypt.hash(password, 10);
  console.log(`\n새로 생성된 해시: ${newHash}`);
  const newValid = await bcrypt.compare(password, newHash);
  console.log(`새 해시 검증 결과: ${newValid ? '성공 ✅' : '실패 ❌'}`);
}

main().catch(console.error);