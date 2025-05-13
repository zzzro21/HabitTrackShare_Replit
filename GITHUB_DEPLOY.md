# GitHub Pages 배포 가이드

이 문서는 모리(Mori) 프로젝트를 GitHub Pages에 배포하는 방법을 안내합니다.

## 1. GitHub Repository 생성

1. GitHub 계정에 로그인합니다.
2. 새 Repository를 생성합니다 (예: `mori-app`).
3. Repository를 public으로 설정합니다.

## 2. 로컬 환경 설정

```bash
# 1. 프로젝트 폴더 초기화
git init

# 2. Remote 설정 (YOUR_USERNAME을 GitHub 사용자명으로 변경)
git remote add origin https://github.com/YOUR_USERNAME/mori-app.git

# 3. 첫 번째 커밋
git add .
git commit -m "Initial commit"

# 4. GitHub에 푸시
git push -u origin main
```

## 3. GitHub Pages 배포를 위한 빌드

```bash
# 1. GitHub Pages용 빌드 (vite.config.github.js 사용)
npx vite build --config vite.config.github.js

# 2. 빌드된 파일들 커밋
git add docs/
git commit -m "Build for GitHub Pages"

# 3. GitHub에 푸시
git push origin main
```

## 4. GitHub Pages 활성화

1. GitHub Repository 설정 페이지로 이동합니다.
2. 좌측 메뉴에서 "Pages"를 선택합니다.
3. Source 섹션에서 "Deploy from a branch"를 선택합니다.
4. Branch 드롭다운에서 "main"을 선택하고, 폴더로는 "/docs"를 선택합니다.
5. "Save" 버튼을 클릭하여 설정을 저장합니다.

## 5. 배포 확인

설정이 저장되면 GitHub에서 자동으로 페이지를 배포합니다. 배포가 완료되면 다음 URL에서 앱을 확인할 수 있습니다:

```
https://YOUR_USERNAME.github.io/mori-app/
```

## 6. 업데이트 방법

코드를 수정한 후 GitHub Pages 배포를 업데이트하려면:

```bash
# 1. 변경사항 커밋
git add .
git commit -m "Update: 변경 내용 설명"

# 2. GitHub Pages용 재빌드
npx vite build --config vite.config.github.js

# 3. 빌드된 파일들 커밋
git add docs/
git commit -m "Update build for GitHub Pages"

# 4. GitHub에 푸시
git push origin main
```

## 참고사항

- `docs/` 폴더는 GitHub Pages 배포를 위한 빌드 결과물을 포함합니다.
- GitHub Pages는 정적 파일만 제공할 수 있으므로, API 서버가 필요한 기능은 정적 더미 데이터로 대체됩니다.
- `client/src/config.js`에서 `useStaticData` 값을 수정하여 정적 데이터 사용 여부를 설정할 수 있습니다.