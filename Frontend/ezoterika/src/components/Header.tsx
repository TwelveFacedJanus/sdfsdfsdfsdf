'use client';

import { useState, useEffect } from 'react';
import { getUserData, getNotifications, markNotificationRead, markAllNotificationsRead, getStoredTokens } from '@/lib/api';

interface HeaderProps {
  activePage?: string;
}

interface Notification {
  id: string;
  notification_type: string;
  notification_type_display: string;
  title: string;
  message: string;
  related_user?: string;
  related_user_fio?: string;
  related_user_avatar?: string;
  is_read: boolean;
  created_at: string;
}

export default function Header({ activePage = 'contents' }: HeaderProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  useEffect(() => {
    const user = getUserData();
    setUserData(user);
    
    // Загружаем уведомления если пользователь авторизован
    const { accessToken } = getStoredTokens();
    if (accessToken) {
      loadNotifications();
    }
  }, []);

  useEffect(() => {
    // Обновляем уведомления при открытии меню
    if (isNotificationsOpen) {
      loadNotifications();
    }
  }, [isNotificationsOpen]);

  const loadNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const response = await getNotifications(false, 10); // Получаем последние 10 уведомлений
      setNotifications(response.notifications || []);
      setUnreadCount(response.unread_count || 0);
    } catch (error) {
      console.error('Error loading notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      // Обновляем локально
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationRead(notification.id);
        // Обновляем локально
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'только что';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин. назад`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч. назад`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

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
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#8A63D2] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}

              {/* Выпадающее меню уведомлений */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-[#1A1826] border border-gray-700 rounded-lg shadow-lg z-50 opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]">
                  {/* Заголовок */}
                  <div className="flex justify-between items-center p-3 sm:p-4 border-b border-gray-700">
                    <h3 className="text-white font-semibold text-sm sm:text-base">Уведомления</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllRead}
                        className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors whitespace-nowrap"
                      >
                        Отметить все
                      </button>
                    )}
                  </div>

                  {/* Список уведомлений */}
                  <div className="max-h-[70vh] sm:max-h-96 overflow-y-auto">
                    {isLoadingNotifications ? (
                      <div className="p-3 sm:p-4 text-center">
                        <div className="text-gray-400 text-xs sm:text-sm">Загрузка...</div>
                      </div>
                    ) : notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-3 sm:p-4 border-b border-gray-700 hover:bg-[#2A2A2A] transition-colors cursor-pointer touch-manipulation ${
                            !notification.is_read ? 'bg-[#2A2A2A]/50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-2 sm:space-x-3">
                            {notification.related_user_avatar ? (
                              <img 
                                src={notification.related_user_avatar.startsWith('data:') 
                                  ? notification.related_user_avatar 
                                  : `data:image/png;base64,${notification.related_user_avatar}`}
                                alt={notification.related_user_fio || 'Пользователь'}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-600 flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                </svg>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-xs sm:text-sm break-words">{notification.message}</p>
                              <p className="text-gray-400 text-xs mt-1">{formatTimeAgo(notification.created_at)}</p>
                            </div>
                            {!notification.is_read && (
                              <div className="w-2 h-2 bg-[#8A63D2] rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 sm:p-4 text-center">
                        <div className="text-gray-400 text-xs sm:text-sm">Нет уведомлений</div>
                      </div>
                    )}
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
                <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-[#171B27] border border-gray-700 rounded-md shadow-lg z-50 opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]">
                  <div className="py-1">
                    <a 
                      href="/profile" 
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2.5 text-sm text-white hover:bg-[#333333] transition-colors touch-manipulation"
                    >
                      Мой профиль
                    </a>
                    <a 
                      href="/settings" 
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2.5 text-sm text-white hover:bg-[#333333] transition-colors touch-manipulation"
                    >
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
                      className="block w-full text-left px-4 py-2.5 text-sm text-white hover:bg-[#333333] transition-colors touch-manipulation"
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