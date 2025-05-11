import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

// 이름 변경 폼 스키마
const nameSchema = z.object({
  name: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.'),
});

// API 키 설정 폼 스키마
const apiKeySchema = z.object({
  googleApiKey: z.string().min(1, 'API 키를 입력해주세요.'),
});

type NameForm = z.infer<typeof nameSchema>;
type ApiKeyForm = z.infer<typeof apiKeySchema>;

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isNameLoading, setIsNameLoading] = useState(false);
  const [isApiKeyLoading, setIsApiKeyLoading] = useState(false);

  const nameForm = useForm<NameForm>({
    resolver: zodResolver(nameSchema),
    defaultValues: {
      name: user?.name || '',
    }
  });

  const apiKeyForm = useForm<ApiKeyForm>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      googleApiKey: user?.googleApiKey || '',
    }
  });

  // 사용자 이름 변경 처리
  const handleNameSubmit = async (data: NameForm) => {
    try {
      setIsNameLoading(true);
      const response = await apiRequest<{
        success: boolean;
        message: string;
      }>('POST', '/api/auth/update-name', data);

      if (response.success) {
        toast({
          title: '성공',
          description: '이름이 성공적으로 변경되었습니다.',
        });
        // 페이지 새로고침으로 데이터 다시 불러오기
        window.location.reload();
      } else {
        toast({
          title: '오류',
          description: response.message || '이름 변경에 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message || '이름 변경 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsNameLoading(false);
    }
  };

  // API 키 설정 처리
  const handleApiKeySubmit = async (data: ApiKeyForm) => {
    try {
      setIsApiKeyLoading(true);
      const response = await apiRequest<{
        success: boolean;
        message: string;
      }>('POST', '/api/auth/api-key', data);

      if (response.success) {
        toast({
          title: '성공',
          description: 'API 키가 성공적으로 저장되었습니다.',
        });
        // 페이지 새로고침으로 데이터 다시 불러오기
        window.location.reload();
      } else {
        toast({
          title: '오류',
          description: response.message || 'API 키 저장에 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message || 'API 키 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsApiKeyLoading(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      const response = await apiRequest<{
        success: boolean;
        message: string;
      }>('POST', '/api/auth/logout', {});

      if (response.success) {
        toast({
          title: '로그아웃 성공',
          description: '로그아웃되었습니다.',
        });
        // 로그인 페이지로 이동
        setLocation('/login');
      }
    } catch (error: any) {
      toast({
        title: '오류',
        description: error.message || '로그아웃 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-700 dark:text-gray-300">사용자 정보 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">로그인이 필요합니다</h1>
          <button
            onClick={() => setLocation('/login')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center">
            프로필 설정
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 text-center">
            사용자 정보와 API 키를 관리합니다.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-14 w-14 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center text-2xl">
              {user.avatar || '👤'}
            </div>
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">
                {user.name || '사용자'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email || '이메일 없음'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ID: {user.username}
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              이름 변경
            </h3>
            <form onSubmit={nameForm.handleSubmit(handleNameSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  이름
                </label>
                <input
                  id="name"
                  type="text"
                  {...nameForm.register('name')}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                {nameForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{nameForm.formState.errors.name.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isNameLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isNameLoading ? '저장 중...' : '이름 저장'}
              </button>
            </form>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              API 키 설정
            </h3>
            <form onSubmit={apiKeyForm.handleSubmit(handleApiKeySubmit)} className="space-y-4">
              <div>
                <label htmlFor="googleApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Google API 키
                </label>
                <input
                  id="googleApiKey"
                  type="text"
                  {...apiKeyForm.register('googleApiKey')}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                />
                {apiKeyForm.formState.errors.googleApiKey && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{apiKeyForm.formState.errors.googleApiKey.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isApiKeyLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isApiKeyLoading ? '저장 중...' : 'API 키 저장'}
              </button>
            </form>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 flex justify-between">
            <button
              onClick={() => setLocation('/home')}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              홈으로 돌아가기
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}