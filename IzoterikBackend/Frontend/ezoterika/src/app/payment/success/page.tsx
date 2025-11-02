'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStoredTokens } from '@/lib/api';
import Header from '@/components/Header';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      router.push('/signIn');
      return;
    }

    // Здесь можно проверить статус платежа через API
    if (sessionId) {
      setIsLoading(false);
    }
  }, [router, sessionId]);

  return (
    <div className="bg-[#1A1826] rounded-lg p-8" style={{ width: '600px' }}>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A63D2]"></div>
        </div>
      ) : (
        <div className="text-center space-y-6">
          <div 
            className="flex items-center justify-center mx-auto"
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
            Оплата успешно завершена!
          </h1>
          <p className="text-gray-300">
            Ваша подписка активирована. Спасибо за покупку!
          </p>
          <button
            onClick={() => router.push('/profile?section=settings')}
            className="px-8 py-3 bg-[#8A63D2] text-white rounded-lg hover:bg-[#7A53C2] transition-colors"
            style={{ borderRadius: '360px' }}
          >
            Вернуться к настройкам
          </button>
        </div>
      )}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <>
      <Header activePage="profile" />
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#090F1B' }}
      >
        <Suspense fallback={
          <div className="bg-[#1A1826] rounded-lg p-8" style={{ width: '600px' }}>
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A63D2]"></div>
            </div>
          </div>
        }>
          <PaymentSuccessContent />
        </Suspense>
      </div>
    </>
  );
}

