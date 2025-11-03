'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, googleAuth, setStoredTokens, setUserData, type RegistrationData, type ApiResponse } from '@/lib/api';

declare global {
  interface Window {
    google: any;
  }
}

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const googleButtonRef = useRef<HTMLDivElement>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Валидация на фронтенде
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (!agreement) {
      setError('Необходимо согласиться с обработкой персональных данных');
      return;
    }

    setIsLoading(true);

    try {
      const registrationData: RegistrationData = {
        fio: fullName,
        email: email,
        password: password,
        password_confirm: confirmPassword,
      };

      const result = await registerUser(registrationData);
      
      // Сохраняем данные пользователя
      if (result.user) {
        setUserData(result.user);
      }
      
      // Перенаправляем на страницу подтверждения email
      router.push('/email-sent');
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message.includes('email')) {
        setError('Пользователь с таким email уже существует');
      } else if (error.message.includes('password')) {
        setError('Ошибка с паролем. Проверьте требования к паролю');
      } else {
        setError(error.message || 'Произошла ошибка при регистрации');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCallback = async (response: any) => {
    if (!response.credential) {
      setError('Ошибка регистрации через Google');
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
      
      // Успешная регистрация/авторизация
      router.push('/contents');
      
    } catch (error: any) {
      console.error('Google auth error:', error);
      setError(error.message || 'Ошибка при регистрации через Google');
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
          text: 'signup_with',
          locale: 'ru',
        }
      );
    };

    loadGoogleScript();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFacebookAuth = () => {
    // Здесь будет логика регистрации через Facebook
    console.log('Facebook registration');
  };

  return (
    <div className="min-h-screen bg-[#282440] flex items-center justify-center p-2 sm:p-4 lg:p-6">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg xl:max-w-xl">
        <form 
          onSubmit={handleSubmit}
          className="bg-[#1A1826] rounded-lg sm:rounded-xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 lg:space-y-6 font-sans"
        >
          {/* Заголовок */}
          <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold text-center">
            Регистрация
          </h1>

          {/* Отображение ошибок */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Поле ФИО */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="fullName" className="block text-white text-xs sm:text-sm font-medium">
              ФИО
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 lg:py-4 bg-transparent border border-gray-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-sm sm:text-base"
              placeholder="ФИО"
              required
            />
          </div>

          {/* Поле email */}
          <div className="space-y-1 sm:space-y-2">
            <label htmlFor="email" className="block text-white text-xs sm:text-sm font-medium">
              Почта
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 lg:py-4 bg-transparent border border-gray-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-sm sm:text-base"
              placeholder="Почта"
              required
            />
          </div>

          {/* Поля паролей */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1 space-y-1 sm:space-y-2">
              <label htmlFor="password" className="block text-white text-xs sm:text-sm font-medium">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 lg:py-4 bg-transparent border border-gray-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-sm sm:text-base"
                placeholder="Пароль"
                required
              />
            </div>
            <div className="flex-1 space-y-1 sm:space-y-2">
              <label htmlFor="confirmPassword" className="block text-white text-xs sm:text-sm font-medium">
                Пароль еще раз
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 lg:py-4 bg-transparent border border-gray-300 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white transition-colors text-sm sm:text-base"
                placeholder="Пароль еще раз"
                required
              />
            </div>
          </div>

          {/* Чекбокс согласия */}
          <div className="flex items-start space-x-3">
            <input
              id="agreement"
              type="checkbox"
              checked={agreement}
              onChange={(e) => setAgreement(e.target.checked)}
              className="mt-1 w-4 h-4 text-[#8A63D2] bg-transparent border-gray-300 rounded focus:ring-[#8A63D2] focus:ring-2"
              required
            />
            <label htmlFor="agreement" className="text-white text-xs sm:text-sm leading-relaxed">
              Я соглашаюсь на обработку персональных данных в соответствии с политикой конфиденциальности
            </label>
          </div>

          {/* Кнопка создания аккаунта */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 sm:py-3 lg:py-4 rounded-[360px] font-medium transition-colors text-sm sm:text-base ${
              isLoading 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-[#8A63D2] text-white hover:bg-[#7A53C2]'
            }`}
          >
            {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
          </button>

          {/* Кнопки социальных сетей */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="flex-1">
              <div ref={googleButtonRef} className="w-full"></div>
              {isGoogleLoading && (
                <div className="mt-2 text-center">
                  <span className="text-white text-sm">Регистрация через Google...</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleFacebookAuth}
              className="flex-1 bg-[#2A2836] text-white py-2 sm:py-3 lg:py-4 rounded-[360px] font-medium hover:bg-[#323050] transition-colors flex items-center justify-center space-x-2 text-xs sm:text-sm border border-gray-300"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span className="hidden sm:inline">Продолжить с Facebook</span>
              <span className="sm:hidden">Facebook</span>
            </button>
          </div>

          {/* Ссылка на вход */}
          <div className="text-center">
            <a 
              href="/signIn" 
              className="text-[#A78BFA] hover:text-[#C4B5FD] transition-colors text-sm"
            >
              Уже есть аккаунт?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
