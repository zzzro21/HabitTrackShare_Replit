#!/bin/bash

# 모리 앱 GitHub 배포 스크립트

echo "===== 모리(MORI) 앱 GitHub 배포 스크립트 ====="
echo ""

# 1. GitHub Pages용 빌드
echo "1. GitHub Pages용 빌드 실행 중..."
npx vite build --config vite.config.github.js
echo "   빌드 완료!"
echo ""

# 2. .nojekyll 파일 생성 (GitHub Pages가 Jekyll을 사용하지 않도록)
echo "2. .nojekyll 파일 생성 중..."
touch docs/.nojekyll
echo "   .nojekyll 파일 생성 완료!"
echo ""

echo "3. GitHub에 커밋 및 푸시"
echo "   다음 명령어를 실행하세요:"
echo ""
echo "   git add docs/ manifest.json"
echo "   git commit -m \"Build for GitHub Pages\""
echo "   git push origin main"
echo ""

echo "4. GitHub Pages 설정"
echo "   GitHub Repository 설정 페이지에서 Pages 섹션으로 이동하여"
echo "   Source를 'Deploy from a branch'로 선택하고,"
echo "   Branch를 'main'으로, 폴더를 '/docs'로 설정하세요."
echo ""

echo "배포 스크립트 완료!"