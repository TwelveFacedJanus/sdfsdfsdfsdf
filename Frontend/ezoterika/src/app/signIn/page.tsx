'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, setStoredTokens, setUserData, type LoginData, type ApiResponse } from '@/lib/api';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    setIsLoading(true);

    try {
      const loginData: LoginData = {
        email: email,
        password: password,
      };

      const result = await loginUser(loginData);
      
      // Сохраняем токены в localStorage
      if (result.tokens) {
        setStoredTokens(result.tokens.access, result.tokens.refresh);
      }
      
      // Сохраняем данные пользователя
      if (result.user) {
        setUserData(result.user);
      }
      
      // Успешная авторизация
      router.push('/contents'); // Перенаправляем на страницу с контентом
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.message.includes('Неверные учетные данные')) {
        setError('Неверный email или пароль');
      } else if (error.message.includes('деактивирован')) {
        setError('Аккаунт деактивирован');
      } else {
        setError(error.message || 'Произошла ошибка при входе');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // Здесь будет логика авторизации через Google
    console.log('Google auth');
  };

  const handleFacebookAuth = () => {
    // Здесь будет логика авторизации через Facebook
    console.log('Facebook auth');
  };

  return (
    <div className="min-h-screen bg-[#282440] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <form 
        onSubmit={handleSubmit}
        className="font-sans w-full max-w-[600px]"
        style={{
          padding: '24px',
          backgroundColor: '#0C1127',
          borderRadius: '12px',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.05)',
          boxShadow: '0px 0px 30px 0px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
          {/* Заголовок */}
          <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold text-center">
            Авторизация
          </h1>

          {/* Отображение ошибок */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Поле email */}
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-gray-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-base"
            placeholder="Почта"
            required
          />

          {/* Поле пароля */}
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-transparent border border-gray-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-base"
            placeholder="Пароль"
            required
          />

          {/* Кнопка входа */}
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
            {isLoading ? 'Вход...' : 'Войти в кабинет'}
          </button>

          {/* Кнопки социальных сетей */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="flex-1 bg-[#282440] text-white py-3 font-medium hover:bg-[#323050] transition-colors flex items-center justify-center space-x-2 text-sm"
              style={{ borderRadius: '360px' }}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <span>Продолжить с Google</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookAuth}
              className="flex-1 bg-[#282440] text-white py-3 font-medium hover:bg-[#323050] transition-colors flex items-center justify-center space-x-2 text-sm"
              style={{ borderRadius: '360px' }}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span>Продолжить с Facebook</span>
            </button>
          </div>

          {/* Ссылки */}
          <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
            <a 
              href="/signUp" 
              className="hover:opacity-80 transition-opacity text-center"
              style={{ color: '#9966CC' }}
            >
              Еще нет аккаунта?
            </a>
            <a 
              href="/forgot-password" 
              className="hover:opacity-80 transition-opacity text-center"
              style={{ color: '#9966CC' }}
            >
              Восстановить пароль
            </a>
          </div>
        </form>
    </div>
  );
}
