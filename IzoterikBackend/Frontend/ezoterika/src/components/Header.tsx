'use client';

import { useState, useEffect } from 'react';
import { getUserData } from '@/lib/api';

interface HeaderProps {
  activePage?: string;
}

export default function Header({ activePage = 'contents' }: HeaderProps) {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
    <header className="bg-[#1A1826] border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <div className="shrink-0">
            <img 
              src="/logo.svg" 
              alt="Ezoterika Logo" 
              className="h-12 w-auto"
            />
          </div>

          {/* Навигация */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  activePage === item.id
                    ? 'bg-[#333333] text-white'
                    : 'text-white hover:text-gray-300'
                }`}
              >
                {item.label}
                {activePage === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]"></div>
                )}
              </a>
            ))}
          </nav>

          {/* Правый блок - уведомления, язык, профиль */}
          <div className="flex items-center space-x-4">
            {/* Уведомления */}
            <div className="relative">
              <button className="text-white hover:text-gray-300 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM5 7h14l-7 7-7-7z" />
                </svg>
              </button>
              {/* Бейдж с количеством уведомлений */}
              <span className="absolute -top-2 -right-2 bg-[#8A63D2] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                99
              </span>
            </div>

            {/* Выбор языка */}
            <div className="relative">
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
                <span className="text-sm">RU</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Выпадающее меню языков */}
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-[#1A1826] border border-gray-700 rounded-md shadow-lg z-50">
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
                className="flex items-center space-x-3 text-white hover:text-gray-300 transition-colors"
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
                <span className="text-sm font-medium">
                  {userData?.fio || 'Пользователь'}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Выпадающее меню профиля */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#1A1826] border border-gray-700 rounded-md shadow-lg z-50">
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
          </div>
        </div>
      </div>
    </header>
  );
}