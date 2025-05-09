import React from 'react';
import TabNavigation from '@/components/TabNavigation';

const SettingsPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg pb-16">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <h1 className="text-lg font-bold text-center">설정</h1>
          <p className="text-xs text-center text-gray-500">습관 관리 앱 설정</p>
        </div>
      </header>
      
      <main className="p-4">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-3">앱 정보</h2>
            <div className="bg-white border rounded-lg divide-y">
              <div className="px-4 py-3">
                <div className="text-sm text-gray-500">버전</div>
                <div>1.0.0</div>
              </div>
              <div className="px-4 py-3">
                <div className="text-sm text-gray-500">앱 설명</div>
                <div className="text-sm">
                  자장격지 행동습관 점검표는 56일(8주) 동안의 습관 형성을 통해 성공의 기반을 다지는 앱입니다.
                  친구들과 함께 습관을 추적하고 진행 상황을 공유할 수 있습니다.
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-3">알림 설정</h2>
            <div className="bg-white border rounded-lg divide-y">
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">일일 습관 알림</div>
                  <div className="text-sm text-gray-500">매일 저녁 9시에 알림</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" id="toggle" className="sr-only" defaultChecked />
                  <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform translate-x-4"></div>
                </div>
              </div>
              
              <div className="px-4 py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">친구 진행상황 알림</div>
                  <div className="text-sm text-gray-500">친구가 습관을 완료했을 때 알림</div>
                </div>
                <div className="relative inline-flex items-center">
                  <input type="checkbox" id="toggle2" className="sr-only" />
                  <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                  <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-medium mb-3">기타 설정</h2>
            <div className="bg-white border rounded-lg divide-y">
              <button className="w-full px-4 py-3 text-left">
                <div className="font-medium text-red-500">로그아웃</div>
              </button>
              <button className="w-full px-4 py-3 text-left">
                <div className="font-medium text-gray-500">도움말</div>
              </button>
              <button className="w-full px-4 py-3 text-left">
                <div className="font-medium text-gray-500">개인정보 처리방침</div>
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <TabNavigation />
    </div>
  );
};

export default SettingsPage;
