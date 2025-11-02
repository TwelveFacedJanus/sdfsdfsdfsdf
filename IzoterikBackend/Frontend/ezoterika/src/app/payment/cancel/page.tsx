'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredTokens } from '@/lib/api';
import Header from '@/components/Header';

export default function PaymentCancelPage() {
  const router = useRouter();

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      router.push('/signIn');
      return;
    }
  }, [router]);

  return (
    <>
      <Header activePage="profile" />
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#090F1B' }}
      >
        <div className="bg-[#1A1826] rounded-lg p-8" style={{ width: '600px' }}>
          <div className="text-center space-y-6">
            <div 
              className="flex items-center justify-center mx-auto"
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: '#ff4444'
              }}
            >
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-white text-2xl font-bold">
              Оплата отменена
            </h1>
            <p className="text-gray-300">
              Оплата была отменена. Вы можете попробовать снова в любое время.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push('/payment')}
                className="px-6 py-3 bg-[#8A63D2] text-white rounded-lg hover:bg-[#7A53C2] transition-colors"
                style={{ borderRadius: '360px' }}
              >
                Попробовать снова
              </button>
              <button
                onClick={() => router.push('/profile?section=settings')}
                className="px-6 py-3 bg-[#1A1826] border border-gray-600 text-white rounded-lg hover:bg-[#2A2A2A] transition-colors"
                style={{ borderRadius: '360px' }}
              >
                Вернуться к настройкам
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

