'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser, setUserData, type RegistrationData, type ApiResponse } from '@/lib/api';

export default function SignUpPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


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

  const handleGoogleAuth = () => {
    // Здесь будет логика регистрации через Google
    console.log('Google registration');
  };

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
              placeholder="Введите ваше ФИО"
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
              placeholder="Введите вашу почту"
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
                placeholder="Введите пароль"
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
                placeholder="Повторите пароль"
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
            className={`w-full py-2 sm:py-3 lg:py-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
              isLoading 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-[#8A63D2] text-white hover:bg-[#7A53C2]'
            }`}
          >
            {isLoading ? 'Создание аккаунта...' : 'Создать аккаунт'}
          </button>

          {/* Кнопки социальных сетей */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="flex-1 bg-[#2A2836] text-white py-2 sm:py-3 lg:py-4 rounded-lg font-medium hover:bg-[#323050] transition-colors flex items-center justify-center space-x-2 text-xs sm:text-sm border border-gray-300"
            >
              <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-4 h-4 sm:w-5 sm:h-5">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <span className="hidden sm:inline">Продолжить с Google</span>
              <span className="sm:hidden">Google</span>
            </button>

            <button
              type="button"
              onClick={handleFacebookAuth}
              className="flex-1 bg-[#2A2836] text-white py-2 sm:py-3 lg:py-4 rounded-lg font-medium hover:bg-[#323050] transition-colors flex items-center justify-center space-x-2 text-xs sm:text-sm border border-gray-300"
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
