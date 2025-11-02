'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Введите email');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка при отправке запроса');
      }

      setIsSuccess(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      setError(error.message || 'Произошла ошибка при отправке запроса');
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
          <Image
            src="/email_verify.png"
            alt="Email sent"
            width={120}
            height={120}
            className="mb-4"
          />
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-2xl font-bold">
              Ссылка для сброса пароля отправлена.
            </h1>
            <p className="text-white text-lg">
              Перейдите по ссылке из письма и следуйте дальнейшим инструкциям.
            </p>
          </div>
          <button
            onClick={() => router.push('/signIn')}
            className="px-8 py-3 text-white font-medium transition-colors hover:opacity-90"
            style={{ 
              borderRadius: '360px',
              backgroundColor: '#8A63D2'
            }}
          >
            Вернуться к входу
          </button>
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
        {/* Заголовок */}
        <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold text-center">
          Восстановление пароля
        </h1>

        {/* Отображение ошибок */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Поле email */}
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-transparent border border-gray-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-base"
          placeholder="Email"
          required
        />

        {/* Кнопка отправки */}
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
          {isLoading ? 'Отправка...' : 'Отправить ссылку'}
        </button>

        {/* Ссылка на вход */}
        <div className="flex flex-row justify-center text-sm">
          <a 
            href="/signIn" 
            className="hover:opacity-80 transition-opacity text-center"
            style={{ color: '#9966CC' }}
          >
            Вернуться к входу
          </a>
        </div>
      </form>
    </div>
  );
}

