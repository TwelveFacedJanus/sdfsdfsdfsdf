'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Токен для сброса пароля не найден');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/confirm-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при сбросе пароля');
      }

      setIsSuccess(true);
      
      // Перенаправляем на страницу входа через 3 секунды
      setTimeout(() => {
        router.push('/signIn');
      }, 3000);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Произошла ошибка при сбросе пароля');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#282440' }}>
        <div 
          className="flex flex-col items-center justify-center p-10 text-center"
          style={{
            backgroundColor: '#0C1127',
            width: '600px',
            minHeight: '400px',
            gap: '32px'
          }}
        >
          <div 
            className="flex items-center justify-center"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              backgroundColor: '#8A63D2'
            }}
          >
            <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-white text-2xl font-bold">
            Пароль успешно изменен!
          </h1>
          <p className="text-white text-lg">
            Вы будете перенаправлены на страницу входа...
          </p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-[#282440] flex items-center justify-center p-2 sm:p-4 lg:p-6">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Неверная ссылка</h1>
          <p className="text-gray-400 mb-6">Ссылка для сброса пароля недействительна или истекла.</p>
          <a 
            href="/signIn" 
            className="text-[#9966CC] hover:opacity-80 transition-opacity"
          >
            Вернуться к входу
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#282440] flex items-center justify-center p-2 sm:p-4 lg:p-6">
      <form 
        onSubmit={handleSubmit}
        className="font-sans"
        style={{
          width: '600px',
          padding: '40px',
          backgroundColor: '#0C1127',
          borderRadius: '12px',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.05)',
          boxShadow: '0px 0px 30px 0px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold text-center">
          Сброс пароля
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-gray-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-base"
          placeholder="Новый пароль"
          required
        />

        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-gray-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-base"
          placeholder="Подтвердите пароль"
          required
        />

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 font-medium transition-colors text-base ${
            isLoading 
              ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
              : 'bg-[#8A63D2] text-white hover:bg-[#7A53C2]'
          }`}
          style={{ borderRadius: '360px' }}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить пароль'}
        </button>

        <a 
          href="/signIn" 
          className="text-center hover:opacity-80 transition-opacity text-sm"
          style={{ color: '#9966CC' }}
        >
          Вернуться к входу
        </a>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#282440] flex items-center justify-center p-2 sm:p-4 lg:p-6">
        <div 
          className="font-sans"
          style={{
            width: '600px',
            padding: '40px',
            backgroundColor: '#0C1127',
            borderRadius: '12px',
            borderWidth: '1px',
            borderColor: 'rgba(255, 255, 255, 0.05)',
            boxShadow: '0px 0px 30px 0px rgba(0, 0, 0, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#8A63D2]"></div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}

