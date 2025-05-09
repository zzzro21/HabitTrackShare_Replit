// 앱 초기화
document.addEventListener('DOMContentLoaded', function() {
  // 탭 기능 설정
  setupTabs();
  
  // 사용자 목록 채우기
  populateUsers();
  
  // 습관 목록 채우기
  populateHabits();
  
  // 주차 선택 버튼 설정
  setupWeekButtons();
  
  // 아침 페이지 시간 설정
  updateTime();
  
  // 이미지 업로드 기능 설정
  setupImageUpload();
  
  // 시작 버튼 설정
  setupStartButton();
  
  // 저장 버튼 설정
  setupSaveButton();
  
  // 설정 저장 버튼 설정
  setupSettingsSaveButton();
});

// 탭 기능 구현
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // 모든 탭 버튼에서 active 클래스 제거
      tabButtons.forEach(b => b.classList.remove('active'));
      
      // 현재 클릭된 버튼에 active 클래스 추가
      this.classList.add('active');
      
      // 모든 탭 콘텐츠 숨기기
      tabContents.forEach(content => content.classList.remove('active'));
      
      // 클릭된 탭에 해당하는 콘텐츠 표시
      const tabId = this.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// 사용자 목록 채우기
function populateUsers() {
  const userGrid = document.getElementById('userGrid');
  
  if (!userGrid) return;
  
  // 샘플 사용자 데이터
  const users = [
    { id: 1, name: "사용자1", avatar: "👤" },
    { id: 2, name: "사용자2", avatar: "👩" },
    { id: 3, name: "사용자3", avatar: "👨" },
    { id: 4, name: "사용자4", avatar: "👧" },
    { id: 5, name: "사용자5", avatar: "👦" },
    { id: 6, name: "사용자6", avatar: "👵" },
    { id: 7, name: "사용자7", avatar: "👴" },
    { id: 8, name: "사용자8", avatar: "👮" }
  ];
  
  // 사용자 목록 생성
  users.forEach(user => {
    const userCard = document.createElement('div');
    userCard.className = 'user-card';
    userCard.setAttribute('data-user-id', user.id);
    userCard.innerHTML = `
      <div class="avatar">${user.avatar}</div>
      <div class="user-name">${user.name}</div>
    `;
    
    // 클릭 이벤트 추가
    userCard.addEventListener('click', function() {
      // 이전에 선택된 사용자 카드에서 active 클래스 제거
      document.querySelectorAll('.user-card').forEach(card => card.classList.remove('active'));
      
      // 현재 카드에 active 클래스 추가
      this.classList.add('active');
    });
    
    userGrid.appendChild(userCard);
  });
  
  // 첫 번째 사용자를 기본적으로 선택
  if (userGrid.children.length > 0) {
    userGrid.children[0].classList.add('active');
  }
}

// 습관 목록 채우기
function populateHabits() {
  const habitsList = document.getElementById('habitsList');
  
  if (!habitsList) return;
  
  // 샘플 습관 데이터
  const habits = [
    { id: 1, name: "독서", icon: "📚" },
    { id: 2, name: "동영상 시청", icon: "🎬" },
    { id: 3, name: "제품 사용", icon: "🧴" },
    { id: 4, name: "미팅 참석", icon: "👥" },
    { id: 5, name: "소비자 관리", icon: "👨‍💼" }
  ];
  
  // 습관 목록 생성
  habits.forEach(habit => {
    const habitItem = document.createElement('div');
    habitItem.className = 'habit-item';
    habitItem.innerHTML = `
      <div class="habit-info">
        <div class="habit-icon">${habit.icon}</div>
        <div class="habit-name">${habit.name}</div>
      </div>
      <div class="habit-actions">
        <button class="habit-btn" data-value="0">안함</button>
        <button class="habit-btn" data-value="1">완료</button>
        <button class="habit-btn" data-value="2">추가</button>
      </div>
    `;
    
    // 버튼 클릭 이벤트 추가
    const buttons = habitItem.querySelectorAll('.habit-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', function() {
        // 현재 습관 항목의 모든 버튼에서 active 클래스 제거
        buttons.forEach(b => b.classList.remove('active'));
        
        // 클릭된 버튼에 active 클래스 추가
        this.classList.add('active');
      });
    });
    
    habitsList.appendChild(habitItem);
  });
}

// 주차 선택 버튼 설정
function setupWeekButtons() {
  const weekButtons = document.querySelectorAll('.week-btn');
  
  weekButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      // 모든 주차 버튼에서 active 클래스 제거
      weekButtons.forEach(b => b.classList.remove('active'));
      
      // 클릭된 버튼에 active 클래스 추가
      this.classList.add('active');
    });
  });
}

// 시간 업데이트 함수
function updateTime() {
  const timeElement = document.querySelector('.current-time');
  const dateElement = document.querySelector('.date');
  
  if (!timeElement || !dateElement) return;
  
  // 현재 시간 설정
  const now = new Date();
  const timeString = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  const dateString = now.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' });
  
  timeElement.textContent = timeString;
  dateElement.textContent = dateString;
}

// 시작 버튼 설정
function setupStartButton() {
  const startButton = document.querySelector('.start-btn');
  
  if (!startButton) return;
  
  startButton.addEventListener('click', function() {
    // 홈 탭으로 이동
    document.querySelector('[data-tab="home"]').click();
  });
}

// 저장 버튼 설정
function setupSaveButton() {
  const saveButton = document.querySelector('.save-btn');
  
  if (!saveButton) return;
  
  saveButton.addEventListener('click', function() {
    alert('메모가 저장되었습니다!');
    
    // 모든 텍스트 영역 초기화
    document.querySelectorAll('textarea').forEach(textarea => {
      textarea.value = '';
    });
  });
}

// 이미지 업로드 기능 설정
function setupImageUpload() {
  const imageUpload = document.getElementById('image-upload');
  const profileImg = document.getElementById('profile-img');
  const settingsProfileImg = document.getElementById('settings-profile-img');
  const changePhotoBtn = document.getElementById('change-photo-btn');
  const profileClock = document.getElementById('profile-clock');
  
  // 현재 시간 업데이트 함수
  function updateProfileClock() {
    if (!profileClock) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    profileClock.textContent = timeString;
  }
  
  // 초기 시계 설정과 1분마다 업데이트
  updateProfileClock();
  setInterval(updateProfileClock, 60000);
  
  if (!imageUpload) return;
  
  // 설정 페이지에서 사진 변경 버튼 이벤트 연결
  if (changePhotoBtn) {
    changePhotoBtn.addEventListener('click', function() {
      imageUpload.click();
    });
  }
  
  imageUpload.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 파일이 이미지인지 확인
    if (!file.type.match('image.*')) {
      alert('이미지 파일을 선택해주세요.');
      return;
    }
    
    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다.');
      return;
    }
    
    // 이미지 미리보기
    const reader = new FileReader();
    
    reader.onload = function(e) {
      // 메인 프로필 이미지 업데이트
      if (profileImg) {
        profileImg.src = e.target.result;
      }
      
      // 설정 페이지 프로필 이미지 업데이트
      if (settingsProfileImg) {
        settingsProfileImg.src = e.target.result;
      }
      
      // 로컬 스토리지에 이미지 URL 저장
      try {
        localStorage.setItem('profileImage', e.target.result);
      } catch (err) {
        console.error('로컬 스토리지에 이미지를 저장하는 데 실패했습니다:', err);
      }
    };
    
    reader.readAsDataURL(file);
  });
  
  // 페이지 로드 시 저장된 이미지가 있으면 표시
  const savedImage = localStorage.getItem('profileImage');
  if (savedImage) {
    if (profileImg) {
      profileImg.src = savedImage;
    }
    if (settingsProfileImg) {
      settingsProfileImg.src = savedImage;
    }
  }
}

// 설정 저장 버튼 설정
function setupSettingsSaveButton() {
  const saveSettingsBtn = document.querySelector('.save-settings-btn');
  
  if (!saveSettingsBtn) return;
  
  saveSettingsBtn.addEventListener('click', function() {
    // 현재 설정 상태 저장
    const toggles = document.querySelectorAll('.toggle input[type="checkbox"]');
    const language = document.querySelector('.language-select');
    
    // 토글 상태 저장
    toggles.forEach((toggle, index) => {
      localStorage.setItem(`setting_toggle_${index}`, toggle.checked);
    });
    
    // 언어 설정 저장
    if (language) {
      localStorage.setItem('setting_language', language.value);
    }
    
    // 저장 성공 알림
    alert('설정이 저장되었습니다!');
  });
  
  // 페이지 로드 시 저장된 설정 불러오기
  const toggles = document.querySelectorAll('.toggle input[type="checkbox"]');
  const language = document.querySelector('.language-select');
  
  // 토글 상태 불러오기
  toggles.forEach((toggle, index) => {
    const savedState = localStorage.getItem(`setting_toggle_${index}`);
    if (savedState !== null) {
      toggle.checked = savedState === 'true';
    }
  });
  
  // 언어 설정 불러오기
  if (language) {
    const savedLanguage = localStorage.getItem('setting_language');
    if (savedLanguage) {
      language.value = savedLanguage;
    }
  }
}