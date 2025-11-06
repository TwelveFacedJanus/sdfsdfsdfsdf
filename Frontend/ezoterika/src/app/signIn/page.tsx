'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, googleAuth, facebookAuth, setStoredTokens, setUserData, type LoginData, type ApiResponse } from '@/lib/api';

declare global {
  interface Window {
    google: any;
    FB: any;
    fbAsyncInit: () => void;
  }
}

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
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

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '936084880439-2jfpq9aih9dpkf8dgn5i5jd8u8o7bv2h.apps.googleusercontent.com';
      
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCallback,
          error_callback: (error: any) => {
            console.error('Google Sign-In error:', error);
            if (error.type === 'popup_closed_by_user') {
              // Пользователь закрыл окно - это нормально
              return;
            }
            if (error.type === 'popup_failed_to_open') {
              setError('Не удалось открыть окно авторизации. Проверьте настройки браузера.');
            } else if (error.type === 'unknown' || error.type === 'origin_mismatch') {
              const currentOrigin = window.location.origin;
              setError(`Ошибка origin_mismatch. Убедитесь, что "${currentOrigin}" добавлен в Authorized JavaScript origins в Google Cloud Console.`);
            } else {
              setError('Ошибка авторизации через Google. Проверьте настройки приложения в Google Cloud Console.');
            }
          },
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
      } catch (error: any) {
        console.error('Error initializing Google Sign-In:', error);
        setError('Ошибка инициализации Google авторизации. Убедитесь, что домен добавлен в Google Cloud Console.');
      }
    };

    loadGoogleScript();

    // Загружаем и инициализируем Facebook SDK
    const loadFacebookSDK = () => {
      // Проверяем, не загружен ли уже скрипт
      if (document.querySelector('script[src*="connect.facebook.net"]')) {
        // Скрипт уже загружается или загружен
        if (window.FB) {
          initFacebookSDK();
        } else {
          // Ждем загрузки SDK
          const checkFB = setInterval(() => {
            if (window.FB) {
              initFacebookSDK();
              clearInterval(checkFB);
            }
          }, 100);
          setTimeout(() => clearInterval(checkFB), 5000);
        }
        return;
      }

      // Сохраняем старый обработчик, если он есть
      const oldFbAsyncInit = window.fbAsyncInit;

      window.fbAsyncInit = () => {
        try {
          if (window.FB) {
            initFacebookSDK();
          }
        } catch (error) {
          console.error('Error in fbAsyncInit:', error);
        }
        
        // Вызываем старый обработчик, если он был
        if (oldFbAsyncInit && typeof oldFbAsyncInit === 'function') {
          oldFbAsyncInit();
        }
      };

      // Загружаем скрипт Facebook SDK
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/ru_RU/sdk.js';
      script.async = true;
      script.defer = true;
      script.id = 'facebook-jssdk';
      script.onload = () => {
        // Если fbAsyncInit не вызвался автоматически, вызываем вручную через небольшую задержку
        setTimeout(() => {
          if (window.fbAsyncInit && !window.FB) {
            window.fbAsyncInit();
          }
        }, 100);
      };
      script.onerror = () => {
        console.error('Failed to load Facebook SDK');
        setError('Не удалось загрузить Facebook SDK. Проверьте подключение к интернету.');
      };
      document.body.appendChild(script);
    };

    const initFacebookSDK = () => {
      try {
        if (!window.FB) {
          console.warn('Facebook SDK not available');
          return;
        }
        window.FB.init({
          appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '',
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
        console.log('Facebook SDK initialized');
      } catch (error) {
        console.error('Error initializing Facebook SDK:', error);
      }
    };

    loadFacebookSDK();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFacebookAuth = async () => {
    setIsFacebookLoading(true);
    setError('');

    try {
      if (!window.FB) {
        setError('Facebook SDK не загружен. Пожалуйста, обновите страницу.');
        setIsFacebookLoading(false);
        return;
      }

      window.FB.login((response: any) => {
        if (response.authResponse) {
          const accessToken = response.authResponse.accessToken;
          handleFacebookCallback(accessToken);
        } else {
          setError('Авторизация через Facebook была отменена');
          setIsFacebookLoading(false);
        }
      }, { scope: 'email,public_profile' });
    } catch (error: any) {
      console.error('Facebook auth error:', error);
      setError(error.message || 'Ошибка при авторизации через Facebook');
      setIsFacebookLoading(false);
    }
  };

  const handleFacebookCallback = async (accessToken: string) => {
    try {
      const result = await facebookAuth({ access_token: accessToken });
      
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
      console.error('Facebook auth error:', error);
      setError(error.message || 'Ошибка при авторизации через Facebook');
    } finally {
      setIsFacebookLoading(false);
    }
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
              disabled={isFacebookLoading}
              className={`flex-1 bg-[#282440] text-white py-3 font-medium hover:bg-[#323050] transition-colors flex items-center justify-center space-x-2 text-sm ${
                isFacebookLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ borderRadius: '360px' }}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
              <span>{isFacebookLoading ? 'Авторизация...' : 'Продолжить с Facebook'}</span>
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
