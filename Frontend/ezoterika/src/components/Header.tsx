'use client';

import { useState, useEffect } from 'react';
import { getUserData } from '@/lib/api';

interface HeaderProps {
  activePage?: string;
}

export default function Header({ activePage = 'contents' }: HeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const user = getUserData();
    setUserData(user);
  }, []);

  const navigationItems = [
    { id: 'catalog', label: 'Каталог', href: '/catalog' },
    { id: 'contents', label: 'Контент-система', href: '/contents' },
    { id: 'profile', label: 'Профиль', href: '/profile' },
    { id: 'plans', label: 'Планы для практиков', href: '/plans' },
  ];

  return (
    <header className="bg-[#171B27] border-b" style={{ borderBottomWidth: '1px', borderBottomColor: 'rgba(255, 255, 255, 0.05)' }}>
      <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-[50px]">
        <div className="flex items-center h-16 md:h-[100px]">
          {/* Логотип */}
          <div className="shrink-0">
            <img 
              src="/logo.svg" 
              alt="Ezoterika Logo" 
              className="h-8 md:h-12 w-auto"
            />
          </div>

          {/* Навигация - десктоп */}
          <nav className="hidden lg:flex space-x-8 h-full ml-[60px]">
            {navigationItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`px-3 py-2 transition-colors relative h-full flex items-center ${
                  activePage === item.id
                    ? 'bg-[#333333] text-white'
                    : 'text-white hover:text-gray-300'
                }`}
                style={{ 
                  fontSize: '18px', 
                  fontWeight: 400, 
                  lineHeight: '150%', 
                  letterSpacing: '0%' 
                }}
              >
                {item.label}
                {activePage === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]"></div>
                )}
              </a>
            ))}
          </nav>

          {/* Правый блок - уведомления, язык, профиль */}
          <div className="flex items-center ml-auto gap-2 sm:gap-4 md:gap-8">
            {/* Уведомления */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="text-white hover:text-gray-300 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              {/* Бейдж с количеством уведомлений */}
              <span className="absolute -top-2 -right-2 bg-[#8A63D2] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                99
              </span>

              {/* Выпадающее меню уведомлений */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1A1826] border border-gray-700 rounded-lg shadow-lg z-50 opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]">
                  {/* Заголовок */}
                  <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h3 className="text-white font-semibold">Уведомления</h3>
                    <button className="text-gray-400 hover:text-white text-sm transition-colors">
                      Отметить все как прочитано
                    </button>
                  </div>

                  {/* Список уведомлений */}
                  <div className="max-h-96 overflow-y-auto">
                    {/* Уведомление 1 */}
                    <div className="p-4 border-b border-gray-700 hover:bg-[#2A2A2A] transition-colors cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <img 
                          src="https://ui-avatars.com/api/?name=Nikita+Belkin&background=random" 
                          alt="Nikita Belkin"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm">Никита Белкин выложил новый пост</p>
                          <p className="text-gray-400 text-xs mt-1">2 часа назад</p>
                        </div>
                        <div className="w-2 h-2 bg-[#8A63D2] rounded-full"></div>
                      </div>
                    </div>

                    {/* Уведомление 2 */}
                    <div className="p-4 border-b border-gray-700 hover:bg-[#2A2A2A] transition-colors cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <img 
                          src="https://ui-avatars.com/api/?name=Maria+Konovalova&background=random" 
                          alt="Maria Konovalova"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm">Мария Коновалова подписалась на вас</p>
                          <p className="text-gray-400 text-xs mt-1">1 день назад</p>
                        </div>
                        <div className="w-2 h-2 bg-[#8A63D2] rounded-full"></div>
                      </div>
                    </div>

                    {/* Уведомление 3 */}
                    <div className="p-4 hover:bg-[#2A2A2A] transition-colors cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <img 
                          src="https://ui-avatars.com/api/?name=Alina+Rulicheva&background=random" 
                          alt="Alina Rulicheva"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <p className="text-white text-sm">Алина Руличева отписалась от вас</p>
                          <p className="text-gray-400 text-xs mt-1">Неделю назад</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Выбор языка - скрыт на мобильных */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors"
              >
                {/* Флаг России */}
                <div className="w-6 h-4 rounded-sm overflow-hidden">
                  <div className="w-full h-1/3 bg-white"></div>
                  <div className="w-full h-1/3 bg-blue-600"></div>
                  <div className="w-full h-1/3 bg-red-600"></div>
                </div>
                <span className="text-sm hidden md:inline">RU</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Выпадающее меню языков */}
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-[#171B27] border border-gray-700 rounded-md shadow-lg z-50 opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]">
                  <div className="py-1">
                    <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-[#333333]">
                      Русский
                    </a>
                    <a href="#" className="block px-4 py-2 text-sm text-white hover:bg-[#333333]">
                      English
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Профиль пользователя */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 md:space-x-3 text-white hover:text-gray-300 transition-colors"
              >
                {/* Аватар */}
                {userData?.base64_image ? (
                  <img 
                    src={userData.base64_image} 
                    alt={userData.fio || 'Пользователь'}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
                <span className="text-sm font-medium hidden md:inline">
                  {userData?.fio || 'Пользователь'}
                </span>
                <svg className="w-4 h-4 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Выпадающее меню профиля */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#171B27] border border-gray-700 rounded-md shadow-lg z-50 opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]">
                  <div className="py-1">
                    <a href="/profile" className="block px-4 py-2 text-sm text-white hover:bg-[#333333]">
                      Мой профиль
                    </a>
                    <a href="/settings" className="block px-4 py-2 text-sm text-white hover:bg-[#333333]">
                      Настройки
                    </a>
                    <hr className="my-1 border-gray-700" />
                    <button 
                      onClick={() => {
                        // Логика выхода
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('refresh_token');
                        localStorage.removeItem('user_data');
                        window.location.href = '/signIn';
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#333333]"
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Мобильное меню */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-white hover:text-gray-300 transition-colors ml-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Мобильное меню навигации */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden border-t border-gray-700 py-4">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 transition-colors ${
                    activePage === item.id
                      ? 'bg-[#333333] text-white'
                      : 'text-white hover:bg-[#333333]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}