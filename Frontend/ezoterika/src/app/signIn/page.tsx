'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, googleAuth, setStoredTokens, setUserData, type LoginData, type ApiResponse } from '@/lib/api';

declare global {
  interface Window {
    google: any;
  }
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef<HTMLDivElement>(null);


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

  const handleGoogleCallback = async (response: any) => {
    if (!response.credential) {
      setError('Ошибка авторизации через Google');
      return;
    }

    setIsGoogleLoading(true);
    setError('');

    try {
      const result = await googleAuth({ credential: response.credential });
      
      // Сохраняем токены в localStorage
      if (result.tokens) {
        setStoredTokens(result.tokens.access, result.tokens.refresh);
      }
      
      // Сохраняем данные пользователя
      if (result.user) {
        setUserData(result.user);
      }
      
      // Успешная авторизация
      router.push('/contents');
      
    } catch (error: any) {
      console.error('Google auth error:', error);
      setError(error.message || 'Ошибка при авторизации через Google');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  useEffect(() => {
    // Загружаем Google Identity Services
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleSignIn();
      };
      document.head.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (!window.google || !googleButtonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: handleGoogleCallback,
      });

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          locale: 'ru',
        }
      );
    };

    loadGoogleScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            <div className="flex-1">
              <div ref={googleButtonRef} className="w-full"></div>
              {isGoogleLoading && (
                <div className="mt-2 text-center">
                  <span className="text-white text-sm">Авторизация через Google...</span>
                </div>
              )}
            </div>

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
