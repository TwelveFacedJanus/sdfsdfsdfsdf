'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmail } from '@/lib/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Токен подтверждения не найден');
        return;
      }

      try {
        const result = await verifyEmail(token);
        setStatus('success');
        setMessage(result.message || 'Email успешно подтвержден!');
        
        // Перенаправляем на страницу входа через 3 секунды
        setTimeout(() => {
          router.push('/signIn');
        }, 3000);
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Ошибка при подтверждении email');
      }
    };

    confirmEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#282440] flex items-center justify-center p-4">
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
        {status === 'loading' && (
          <>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#8A63D2]"></div>
            </div>
            <h1 className="text-white text-2xl font-bold text-center">
              Подтверждение email
            </h1>
            <p className="text-gray-300 text-center">
              Подождите, идет подтверждение вашего email...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="flex justify-center">
              <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-white text-2xl font-bold text-center">
              Email подтвержден!
            </h1>
            <p className="text-gray-300 text-center">
              {message}
            </p>
            <p className="text-gray-400 text-center text-sm">
              Вы будете перенаправлены на страницу входа через несколько секунд...
            </p>
            <button
              onClick={() => router.push('/signIn')}
              className="w-full py-3 font-medium transition-colors bg-[#8A63D2] text-white hover:bg-[#7A53C2]"
              style={{ borderRadius: '360px' }}
            >
              Войти
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="flex justify-center">
              <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-white text-2xl font-bold text-center">
              Ошибка подтверждения
            </h1>
            <p className="text-gray-300 text-center">
              {message}
            </p>
            <button
              onClick={() => router.push('/signIn')}
              className="w-full py-3 font-medium transition-colors bg-[#8A63D2] text-white hover:bg-[#7A53C2]"
              style={{ borderRadius: '360px' }}
            >
              Перейти к входу
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#282440] flex items-center justify-center p-4">
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
      <VerifyEmailContent />
    </Suspense>
  );
}

