// 로그인 테스트 스크립트
import bcrypt from 'bcryptjs';

// 테스트용 사용자 데이터
const users = [
  {
    id: 9,
    username: 'admin',
    password: '$2b$10$19Gj0rJa07ZKG0Vl5y1lGeQnxK4UpYGCuOqZcFvTwQpy71XVC5oZi', // 서버 로그에서 확인한 실제 해시
    name: '관리자',
    email: 'admin@example.com',
    avatar: '👤'
  },
  {
    id: 1,
    username: 'user1',
    password: '$2b$10$19Gj0rJa07ZKG0Vl5y1lGeQnxK4UpYGCuOqZcFvTwQpy71XVC5oZi', // 동일한 해시 사용
    name: '사용자1',
    email: 'user1@example.com',
    avatar: '🙂'
  }
];

// 로그인 테스트 함수
async function testLogin(username, password) {
  console.log(`\n===== 로그인 테스트: ${username} / ${password} =====`);
  
  // 사용자 찾기
  const user = users.find(u => u.username === username);
  
  if (!user) {
    console.log('❌ 로그인 실패: 사용자를 찾을 수 없음');
    return false;
  }
  
  console.log(`✅ 사용자 찾음: ${user.name} (ID: ${user.id})`);
  
  // 비밀번호 확인
  try {
    console.log('비밀번호 검증 시도...');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (isPasswordValid) {
      console.log('✅ 비밀번호 검증 성공!');
      console.log(`✅ 로그인 성공: ${user.name} (${user.username})`);
      return true;
    } else {
      console.log('❌ 비밀번호 검증 실패');
      return false;
    }
  } catch (error) {
    console.error('❌ 비밀번호 검증 중 오류 발생:', error);
    return false;
  }
}

// 서버에서 실제 등록된 계정으로 로그인 테스트
async function main() {
  console.log('===== 습관 추적기 로그인 테스트 =====');
  
  // 정상 로그인 테스트
  await testLogin('admin', 'password123');
  
  // 잘못된 비밀번호 테스트
  await testLogin('admin', 'wrongpassword');
  
  // 존재하지 않는 사용자 테스트
  await testLogin('unknownuser', 'password123');
}

// 테스트 실행
main().catch(console.error);