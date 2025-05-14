import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import AppLayout from '@/components/AppLayout';

const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showUsernameForm, setShowUsernameForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [usernamePassword, setUsernamePassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "비밀번호 불일치",
        description: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "비밀번호 오류",
        description: "비밀번호는 6자 이상이어야 합니다.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiRequest('POST', '/api/auth/change-password', {
        currentPassword,
        newPassword
      });

      toast({
        title: "비밀번호 변경 완료",
        description: "비밀번호가 성공적으로 변경되었습니다.",
        duration: 3000
      });

      // 폼 초기화
      setShowPasswordForm(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast({
        title: "비밀번호 변경 실패",
        description: error.message || "비밀번호 변경 중 오류가 발생했습니다.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUsername.trim()) {
      toast({
        title: "아이디 오류",
        description: "새 아이디를 입력해주세요.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    if (newUsername.length < 4) {
      toast({
        title: "아이디 오류",
        description: "아이디는 4자 이상이어야 합니다.",
        variant: "destructive",
        duration: 3000
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiRequest('POST', '/api/auth/change-username', {
        newUsername,
        password: usernamePassword
      });

      toast({
        title: "아이디 변경 완료",
        description: "아이디가 성공적으로 변경되었습니다. 다시 로그인해 주세요.",
        duration: 3000
      });

      // 아이디 변경 후 로그아웃 필요
      setTimeout(() => {
        logout();
      }, 2000);
      
    } catch (error: any) {
      toast({
        title: "아이디 변경 실패",
        description: error.message || "아이디 변경 중 오류가 발생했습니다.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title="설정" subtitle="습관 관리 앱 설정" showBackButton={false}>
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
          <h2 className="text-lg font-medium mb-3">개인정보 관리</h2>
          <div className="bg-white border rounded-lg divide-y">
            <button 
              onClick={() => setShowPasswordForm(!showPasswordForm)} 
              className="w-full px-4 py-3 text-left"
            >
              <div className="font-medium text-blue-600">비밀번호 변경</div>
            </button>
            
            {showPasswordForm && (
              <div className="p-4 bg-gray-50">
                <form onSubmit={handleChangePassword}>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        현재 비밀번호
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        새 비밀번호
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        비밀번호 확인
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordForm(false);
                          setCurrentPassword('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                        className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md bg-white"
                        disabled={isSubmitting}
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? '처리 중...' : '변경하기'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            <button 
              onClick={() => setShowUsernameForm(!showUsernameForm)} 
              className="w-full px-4 py-3 text-left"
              disabled={user?.hasChangedUsername}
            >
              <div className={`font-medium ${user?.hasChangedUsername ? 'text-gray-400' : 'text-blue-600'}`}>
                아이디 변경
                {user?.hasChangedUsername && ' (변경 불가)'}
              </div>
              <div className="text-xs text-gray-500">※ 최초 1회만 변경 가능합니다</div>
            </button>
            
            {showUsernameForm && !user?.hasChangedUsername && (
              <div className="p-4 bg-gray-50">
                <form onSubmit={handleChangeUsername}>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="newUsername" className="block text-sm font-medium text-gray-700 mb-1">
                        새 아이디
                      </label>
                      <input
                        type="text"
                        id="newUsername"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="usernamePassword" className="block text-sm font-medium text-gray-700 mb-1">
                        비밀번호 확인
                      </label>
                      <input
                        type="password"
                        id="usernamePassword"
                        value={usernamePassword}
                        onChange={(e) => setUsernamePassword(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div className="flex items-center justify-end space-x-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUsernameForm(false);
                          setNewUsername('');
                          setUsernamePassword('');
                        }}
                        className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md bg-white"
                        disabled={isSubmitting}
                      >
                        취소
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? '처리 중...' : '변경하기'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            <div className="px-4 py-3">
              <div className="text-sm text-gray-500">가입 아이디</div>
              <div className="font-medium">{user?.username || '-'}</div>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-medium mb-3">기타 설정</h2>
          <div className="bg-white border rounded-lg divide-y">
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-3 text-left"
            >
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
    </AppLayout>
  );
};

export default SettingsPage;
