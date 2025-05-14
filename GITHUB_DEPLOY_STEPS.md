# 모리(MORI) GitHub Pages 배포 가이드

이 문서는 모리(MORI) 앱을 GitHub Pages에 배포하기 위한 상세 절차를 안내합니다.

## 사전 준비

1. GitHub 계정이 필요합니다.
2. Git이 로컬 머신에 설치되어 있어야 합니다.
3. Node.js와 npm이 설치되어 있어야 합니다.

## 단계별 배포 과정

### 1. GitHub 저장소 생성

1. GitHub 계정에 로그인합니다.
2. 우측 상단의 '+' 버튼을 클릭하고 'New repository'를 선택합니다.
3. 저장소 이름을 입력합니다 (예: 'mori-app').
4. 저장소를 Public으로 설정합니다 (GitHub Pages는 무료 계정에서 Public 저장소만 지원).
5. 'Create repository' 버튼을 클릭합니다.

### 2. 로컬 Git 저장소 설정

```bash
# 프로젝트 디렉토리로 이동
cd 프로젝트_디렉토리_경로

# Git 저장소 초기화
git init

# GitHub 원격 저장소 연결 (YOUR_USERNAME을 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/mori-app.git

# 모든 파일 추가
git add .

# 첫 번째 커밋
git commit -m "Initial commit"

# GitHub에 푸시
git push -u origin main
```

### 3. GitHub Pages 배포용 빌드

이 프로젝트는 GitHub Pages에서 작동하도록 특별히 구성된 빌드 프로세스가 있습니다:

```bash
# GitHub Pages용 빌드 스크립트 실행
./deploy-to-github.sh
```

또는 수동으로 빌드 명령을 실행할 수 있습니다:

```bash
# GitHub Pages용 빌드
npx vite build --config vite.config.github.js

# .nojekyll 파일 생성 (GitHub Pages가 Jekyll을 사용하지 않도록)
touch docs/.nojekyll

# 빌드된 파일 커밋
git add docs/ public/ manifest.json
git commit -m "Build for GitHub Pages"

# GitHub에 푸시
git push origin main
```

### 4. GitHub Pages 설정 활성화

1. GitHub에서 저장소 페이지로 이동합니다.
2. 'Settings' 탭을 클릭합니다.
3. 좌측 메뉴에서 'Pages'를 선택합니다.
4. 'Source' 섹션에서 'Deploy from a branch'를 선택합니다.
5. 'Branch' 드롭다운에서 'main' 브랜치를 선택합니다.
6. 폴더 드롭다운에서 '/docs'를 선택합니다.
7. 'Save' 버튼을 클릭합니다.
8. 설정이 저장되면 GitHub가 페이지를 배포합니다. 배포가 완료되면 초록색 배너에 URL이 표시됩니다.

### 5. 배포 확인

배포된 앱은 다음 URL에서 확인할 수 있습니다:
```
https://YOUR_USERNAME.github.io/mori-app/
```

### 6. 업데이트 방법

코드를 수정한 후 GitHub Pages 배포를 업데이트하려면:

```bash
# 변경사항 커밋
git add .
git commit -m "Update: 변경 내용 설명"

# GitHub Pages용 재빌드
npx vite build --config vite.config.github.js

# .nojekyll 파일 확인 (없으면 생성)
touch docs/.nojekyll

# 빌드된 파일 커밋
git add docs/
git commit -m "Update build for GitHub Pages"

# GitHub에 푸시
git push origin main
```

## 주의사항

1. GitHub Pages는 정적 웹사이트만 호스팅할 수 있습니다. 서버 기능은 실행되지 않습니다.
2. 이 프로젝트는 정적 데이터로 동작하도록 구성되어 있습니다. `config.js`에서 `isGitHubPages`와 `useStaticData`를 확인하세요.
3. 다음 설정이 올바르게 되어 있는지 확인하세요:
   - client/src/config.js 파일에서 GitHub Pages 배포 시 isGitHubPages 값이 true로 설정
   - useStaticData 값이 GitHub Pages 배포 시 true로 설정
4. 정적 데이터는 `public/api/` 디렉토리에 있습니다.

## 문제 해결

- 404 오류: GitHub Pages 설정이 올바른지, 저장소 이름과 URL이 일치하는지 확인하세요.
- 빈 화면: 브라우저 콘솔에서 오류를 확인하고 경로 설정을 확인하세요.
- 데이터 로드 문제: 정적 JSON 파일이 올바른 형식인지 확인하세요.