import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

// 폼 스키마 정의
const loginSchema = z.object({
  username: z.string()
    .min(3, '아이디는 3자 이상이어야 합니다.'),
  password: z.string()
    .min(6, '비밀번호는 6자 이상이어야 합니다.'),
});

const registerSchema = z.object({
  name: z.string()
    .min(2, '이름은 2자 이상이어야 합니다.'),
  username: z.string()
    .min(3, '아이디는 3자 이상이어야 합니다.'),
  email: z.string()
    .email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string()
    .min(6, '비밀번호는 6자 이상이어야 합니다.'),
  confirmPassword: z.string()
    .min(6, '비밀번호는 6자 이상이어야 합니다.'),
  inviteCode: z.string()
    .min(6, '초대 코드는 6자 이상이어야 합니다.'),
  avatar: z.string()
    .default('/default-avatar.png'),
}).refine(data => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // 로그인 폼
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  });

  // 회원가입 폼
  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      inviteCode: '',
      avatar: `/avatars/avatar${Math.floor(Math.random() * 8) + 1}.png`,
    }
  });

  // 로그인 제출 처리
  const handleLoginSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiRequest<{
        success: boolean;
        message: string;
        user?: any;
      }>('POST', '/api/auth/login', data);
      
      if (response.success) {
        setLocation('/');
      } else {
        setError(response.message || '로그인에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 회원가입 제출 처리
  const handleRegisterSubmit = async (data: RegisterForm) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // confirmPassword는 서버로 보내지 않음
      const { confirmPassword, ...registerData } = data;
      
      const response = await apiRequest<{
        success: boolean;
        message: string;
        user?: any;
      }>('POST', '/api/auth/register', registerData);
      
      if (response.success) {
        setLocation('/');
      } else {
        setError(response.message || '회원가입에 실패했습니다.');
      }
    } catch (err: any) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-100 to-blue-100 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white dark:bg-gray-800 p-10 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {isLogin ? '로그인' : '회원가입'}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {isLogin ? '습관 트래커에 오신 것을 환영합니다!' : '새 계정을 만들어보세요!'}
          </p>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">오류</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {isLogin ? (
          // 로그인 폼
          <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="mt-8 space-y-6">
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  아이디
                </label>
                <input
                  id="username"
                  type="text"
                  {...loginForm.register('username')}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 placeholder-gray-400 dark:placeholder-gray-300 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="아이디를 입력하세요"
                />
                {loginForm.formState.errors.username && (
                  <p className="mt-1 text-xs text-red-600">{loginForm.formState.errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  {...loginForm.register('password')}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 placeholder-gray-400 dark:placeholder-gray-300 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="비밀번호를 입력하세요"
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </div>
          </form>
        ) : (
          // 회원가입 폼
          <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="mt-8 space-y-6">
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  이름
                </label>
                <input
                  id="name"
                  type="text"
                  {...registerForm.register('name')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="이름을 입력하세요"
                />
                {registerForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-username" className="block text-sm font-medium text-gray-700">
                  아이디
                </label>
                <input
                  id="reg-username"
                  type="text"
                  {...registerForm.register('username')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="아이디를 입력하세요"
                />
                {registerForm.formState.errors.username && (
                  <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  이메일
                </label>
                <input
                  id="email"
                  type="email"
                  {...registerForm.register('email')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="이메일을 입력하세요"
                />
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-gray-700">
                  비밀번호
                </label>
                <input
                  id="reg-password"
                  type="password"
                  {...registerForm.register('password')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="비밀번호를 입력하세요"
                />
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  비밀번호 확인
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  {...registerForm.register('confirmPassword')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="비밀번호를 다시 입력하세요"
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="invite-code" className="block text-sm font-medium text-gray-700">
                  초대 코드
                </label>
                <input
                  id="invite-code"
                  type="text"
                  {...registerForm.register('inviteCode')}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                  placeholder="초대 코드를 입력하세요"
                />
                {registerForm.formState.errors.inviteCode && (
                  <p className="mt-1 text-xs text-red-600">{registerForm.formState.errors.inviteCode.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {isLoading ? '회원가입 중...' : '회원가입'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-4 flex items-center justify-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-medium text-indigo-600 dark:text-blue-400 hover:text-indigo-500 dark:hover:text-blue-300"
          >
            {isLogin ? '새 계정 만들기' : '이미 계정이 있으신가요? 로그인하기'}
          </button>
        </div>
      </div>
    </div>
  );
}