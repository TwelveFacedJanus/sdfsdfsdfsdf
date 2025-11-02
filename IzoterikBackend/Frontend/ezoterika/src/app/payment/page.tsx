'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredTokens, apiRequest } from '@/lib/api';
import Header from '@/components/Header';

export default function PaymentPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [stripeLoaded, setStripeLoaded] = useState(false);

  useEffect(() => {
    // Проверяем авторизацию
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      router.push('/signIn');
      return;
    }

    // Загружаем Stripe
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        setStripeLoaded(true);
        setIsLoading(false);
      };
      script.onerror = () => {
        setError('Не удалось загрузить Stripe');
        setIsLoading(false);
      };
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [router]);

  const handleCheckout = async (priceId: string = 'price_default') => {
    try {
      setIsLoading(true);
      setError('');

      // Создаем сессию Stripe Checkout на бэкенде
      const data = await apiRequest<{ sessionId: string; url: string }>(
        '/api/user/create-checkout-session',
        {
          method: 'POST',
          body: JSON.stringify({
            priceId: priceId,
          }),
        }
      );

      const { sessionId, url } = data;
      
      // Если есть прямая ссылка, можем использовать её
      if (url) {
        window.location.href = url;
        return;
      }

      // Перенаправляем на Stripe Checkout
      if (typeof window !== 'undefined' && (window as any).Stripe) {
        const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_51YourKeyHere');
        const { error: redirectError } = await stripe.redirectToCheckout({
          sessionId: sessionId,
        });

        if (redirectError) {
          throw new Error(redirectError.message);
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || 'Произошла ошибка при создании сессии оплаты');
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header activePage="profile" />
      <div 
        className="min-h-screen"
        style={{ backgroundColor: '#090F1B' }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Заголовок */}
            <h1 className="text-white mb-6" style={{ fontSize: '52px', fontWeight: 600, lineHeight: '120%', letterSpacing: '0%' }}>
              Оплата подписки
            </h1>

            <div className="bg-[#1A1826] rounded-lg p-8" style={{ width: '886px' }}>
              {error && (
                <div className="mb-6 bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {!stripeLoaded ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A63D2]"></div>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Информация о подписке */}
                  <div>
                    <h2 className="text-white text-2xl font-bold mb-4">Выберите план подписки</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {/* Базовый план */}
                      <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-600">
                        <h3 className="text-white text-xl font-bold mb-2">Базовый</h3>
                        <div className="text-3xl font-bold text-white mb-4">
                          999₽<span className="text-sm text-gray-400">/мес</span>
                        </div>
                        <ul className="space-y-2 mb-6 text-gray-300 text-sm">
                          <li>✓ Доступ к базовому контенту</li>
                          <li>✓ Ограниченные функции</li>
                        </ul>
                        <button
                          onClick={() => handleCheckout('price_basic')}
                          disabled={isLoading}
                          className="w-full px-4 py-2 bg-[#8A63D2] text-white rounded-lg hover:bg-[#7A53C2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Загрузка...' : 'Выбрать план'}
                        </button>
                      </div>

                      {/* Премиум план */}
                      <div className="bg-[#8A63D2] rounded-lg p-6 border-2 border-[#8A63D2] relative">
                        <div className="absolute top-0 right-0 bg-[#8A63D2] text-white text-xs px-3 py-1 rounded-bl-lg">
                          Популярный
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">Премиум</h3>
                        <div className="text-3xl font-bold text-white mb-4">
                          1999₽<span className="text-sm text-white/80">/мес</span>
                        </div>
                        <ul className="space-y-2 mb-6 text-white/90 text-sm">
                          <li>✓ Полный доступ к контенту</li>
                          <li>✓ Приоритетная поддержка</li>
                          <li>✓ Все функции платформы</li>
                        </ul>
                        <button
                          onClick={() => handleCheckout('price_premium')}
                          disabled={isLoading}
                          className="w-full px-4 py-2 bg-white text-[#8A63D2] rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                        >
                          {isLoading ? 'Загрузка...' : 'Выбрать план'}
                        </button>
                      </div>

                      {/* Премиум+ план */}
                      <div className="bg-[#2A2A2A] rounded-lg p-6 border border-gray-600">
                        <h3 className="text-white text-xl font-bold mb-2">Премиум+</h3>
                        <div className="text-3xl font-bold text-white mb-4">
                          2999₽<span className="text-sm text-gray-400">/мес</span>
                        </div>
                        <ul className="space-y-2 mb-6 text-gray-300 text-sm">
                          <li>✓ Все функции Премиум</li>
                          <li>✓ Эксклюзивный контент</li>
                          <li>✓ Персональный консультант</li>
                        </ul>
                        <button
                          onClick={() => handleCheckout('price_premium_plus')}
                          disabled={isLoading}
                          className="w-full px-4 py-2 bg-[#8A63D2] text-white rounded-lg hover:bg-[#7A53C2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Загрузка...' : 'Выбрать план'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Информация о безопасности */}
                  <div className="bg-[#2A2A2A] border border-gray-600 rounded-lg p-6">
                    <div className="flex items-start space-x-3">
                      <svg className="w-6 h-6 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <h3 className="text-white font-bold mb-2">Безопасная оплата</h3>
                        <p className="text-gray-300 text-sm">
                          Оплата обрабатывается через Stripe - безопасную платформу для обработки платежей. 
                          Ваши данные защищены и не сохраняются на наших серверах.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Кнопка возврата */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => router.push('/profile?section=settings')}
                      className="px-6 py-3 bg-[#1A1826] border border-gray-600 text-white rounded-lg hover:bg-[#2A2A2A] transition-colors"
                    >
                      Вернуться к настройкам
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

