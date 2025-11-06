'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getStoredTokens, getUserData, updateUserProfile, convertFileToBase64, getUserProfile, getUserHistory, getUserSettings, updateUserSettings, changePassword, getPaymentHistory, getUserSubscriptions, unsubscribeFromUser } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface UserProfile {
  id: string;
  fio: string;
  email: string;
  nickname?: string;
  date_of_birth?: string;
  country?: string;
  language?: string;
  base64_image?: string;
  is_subscribed?: boolean;
  subscribe_expired?: string;
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('data');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    nickname: '',
    date_of_birth: '',
    country: 'Россия',
    language: 'ru',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyFilters, setHistoryFilters] = useState({
    category: '',
    dateFrom: '',
    dateTo: ''
  });
  const [settingsData, setSettingsData] = useState({
    language: 'ru',
    notifications: {
      email: true,
      internal: true,
      push: true
    },
    subscription: {
      isActive: true,
      expiresAt: '2025-09-20',
      plan: 'premium'
    }
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false);

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      router.push('/signIn');
      return;
    }

    // Читаем query параметр section для установки активной секции
    const section = searchParams.get('section');
    if (section && ['data', 'history', 'favorites', 'settings'].includes(section)) {
      setActiveSection(section);
    }

    loadUserProfile();
  }, [router, searchParams]);

  useEffect(() => {
    if (activeSection === 'history') {
      loadUserHistory();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'settings') {
      loadUserSettings();
    }
  }, [activeSection]);

  useEffect(() => {
    if (activeSection === 'favorites') {
      loadSubscriptions();
    }
  }, [activeSection]);

  const loadUserProfile = async () => {
    try {
      // Сначала загружаем данные с сервера
      const response = await getUserProfile();
      const serverUserData = response.user;
      
      // Обновляем локальные данные
      setUserProfile(serverUserData);
      setFormData({
        nickname: serverUserData.nickname || '',
        date_of_birth: serverUserData.date_of_birth || '',
        country: serverUserData.country || 'Россия',
        language: serverUserData.language || 'ru',
      });
      
      // Сохраняем обновленные данные в localStorage
      localStorage.setItem('user_data', JSON.stringify(serverUserData));
    } catch (error) {
      console.error('Error loading profile from server:', error);
      
      // Fallback к локальным данным
      const localUser = getUserData();
      if (localUser) {
        setUserProfile(localUser);
        setFormData({
          nickname: localUser.nickname || '',
          date_of_birth: localUser.date_of_birth || '',
          country: localUser.country || 'Россия',
          language: localUser.language || 'ru',
        });
      }
    }
    setIsLoading(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await updateUserProfile(formData);
      
      // Обновляем локальные данные с данными с сервера
      if (response.user) {
        setUserProfile(response.user);
        localStorage.setItem('user_data', JSON.stringify(response.user));
      }
      
      // Показываем уведомление об успехе
      alert('Профиль успешно обновлен!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Ошибка при обновлении профиля');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    loadUserProfile();
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    try {
      const base64Image = await convertFileToBase64(file);
      
      // Обновляем профиль с новой аватаркой
      const response = await updateUserProfile({ base64_image: base64Image });
      
      // Обновляем локальные данные с данными с сервера
      if (response.user) {
        setUserProfile(response.user);
        localStorage.setItem('user_data', JSON.stringify(response.user));
      }
      
      alert('Аватарка успешно обновлена!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert(error instanceof Error ? error.message : 'Ошибка при загрузке аватарки');
    } finally {
      setIsUploadingAvatar(false);
      // Очищаем input
      event.target.value = '';
    }
  };

  const handleAvatarClick = () => {
    const input = document.getElementById('avatar-input') as HTMLInputElement;
    input?.click();
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Вы уверены, что хотите удалить аватарку?')) return;

    setIsUploadingAvatar(true);
    try {
      const response = await updateUserProfile({ base64_image: null });
      
      // Обновляем локальные данные с данными с сервера
      if (response.user) {
        setUserProfile(response.user);
        localStorage.setItem('user_data', JSON.stringify(response.user));
      }
      
      alert('Аватарка удалена!');
    } catch (error) {
      console.error('Error removing avatar:', error);
      alert('Ошибка при удалении аватарки');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    router.push('/signIn');
  };

  const loadUserHistory = async () => {
    setIsLoadingHistory(true);
    try {
      // Используем реальный API
      const response = await getUserHistory(
        historyFilters.category || undefined,
        historyFilters.dateFrom || undefined,
        historyFilters.dateTo || undefined
      );
      setHistoryItems(response.history || []);
    } catch (error) {
      console.error('Error loading history:', error);
      setHistoryItems([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleFilterChange = (field: string, value: string) => {
    setHistoryFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Автоматически применяем фильтры при изменении
    setTimeout(() => {
      loadUserHistory();
    }, 100);
  };

  const applyHistoryFilters = () => {
    loadUserHistory();
  };

  const loadUserSettings = async () => {
    try {
      const response = await getUserSettings();
      if (response.settings) {
        setSettingsData(response.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Fallback к значениям по умолчанию
    }
  };

  const handleSettingsChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setSettingsData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setSettingsData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    try {
      const response = await updateUserSettings(settingsData);
      if (response.settings) {
        setSettingsData(response.settings);
      }
      alert('Настройки успешно сохранены!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleCancelSettings = () => {
    // Сбрасываем настройки к исходным значениям
    setSettingsData({
      language: 'ru',
      notifications: {
        email: true,
        internal: true,
        push: true
      },
      subscription: {
        isActive: true,
        expiresAt: '2025-09-20',
        plan: 'premium'
      }
    });
  };

  const handleChangePassword = async () => {
    const currentPassword = prompt('Введите текущий пароль:');
    if (!currentPassword) return;
    
    const newPassword = prompt('Введите новый пароль:');
    if (!newPassword) return;
    
    const confirmPassword = prompt('Подтвердите новый пароль:');
    if (newPassword !== confirmPassword) {
      alert('Пароли не совпадают!');
      return;
    }
    
    try {
      await changePassword(currentPassword, newPassword);
      alert('Пароль успешно изменен!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Ошибка при смене пароля');
    }
  };

  const handlePaySubscription = () => {
    router.push('/payment');
  };

  const handleOpenPaymentHistory = async () => {
    try {
      const response = await getPaymentHistory();
      const payments = response.payments || [];
      
      if (payments.length === 0) {
        alert('История платежей пуста');
        return;
      }
      
      // Показываем историю платежей в простом формате
      const historyText = payments.map((payment: any) => 
        `${payment.date}: ${payment.description} - ${payment.amount} ${payment.currency}`
      ).join('\n');
      
      alert(`История платежей:\n\n${historyText}`);
    } catch (error) {
      console.error('Error loading payment history:', error);
      alert('Ошибка при загрузке истории платежей');
    }
  };

  const loadSubscriptions = async () => {
    setIsLoadingSubscriptions(true);
    try {
      const response = await getUserSubscriptions();
      setSubscriptions(response.subscriptions || []);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      setSubscriptions([]);
    } finally {
      setIsLoadingSubscriptions(false);
    }
  };

  const handleUnsubscribe = async (userId: string, userName: string) => {
    if (!confirm(`Вы уверены, что хотите отписаться от ${userName}?`)) {
      return;
    }

    try {
      await unsubscribeFromUser(userId);
      // Обновляем список подписок
      setSubscriptions(prev => prev.filter(sub => sub.subscribed_to !== userId));
      alert('Вы успешно отписались');
    } catch (error: any) {
      console.error('Error unsubscribing:', error);
      alert(error.message || 'Ошибка при отписке');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const navigationItems = [
    { id: 'data', label: 'Данные' },
    { id: 'history', label: 'История' },
    { id: 'favorites', label: 'Избранное' },
    { id: 'settings', label: 'Настройки' },
  ];

  const getSectionTitle = () => {
    const currentItem = navigationItems.find(item => item.id === activeSection);
    return currentItem ? currentItem.label : 'Профиль';
  };

  if (isLoading) {
    return (
      <>
        <Header activePage="profile" />
        <div 
          className="min-h-screen"
          style={{ 
            backgroundColor: '#090F1B'
          }}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-7xl mx-auto">
              <div className="flex gap-8">
                <div className="w-64">
                  <div className="bg-[#1A1826] rounded-lg p-6 animate-pulse">
                    <div className="h-8 bg-gray-600 rounded w-1/2 mb-6"></div>
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-6 bg-gray-600 rounded w-full"></div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-[#1A1826] rounded-lg p-8 animate-pulse">
                    <div className="space-y-6">
                      {[...Array(5)].map((_, i) => (
                        <div key={i}>
                          <div className="h-4 bg-gray-600 rounded w-1/4 mb-2"></div>
                          <div className="h-10 bg-gray-600 rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header activePage="profile" />
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: '#090F1B'
        }}
      >
        <div className="w-full max-w-full mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 lg:py-8">
          <div className="max-w-7xl mx-auto w-full">
            {/* Заголовок */}
            <h1 className="text-white mb-4 sm:mb-6 text-2xl sm:text-3xl lg:text-5xl font-semibold sm:font-bold" style={{ lineHeight: '120%', letterSpacing: '0%' }}>Профиль</h1>
            
            <div className="bg-[#1A1826] rounded-lg p-4 sm:p-6 lg:p-8 w-full max-w-[886px]">
              <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-8 w-full">
                {/* Левая навигация */}
                <div className="w-full lg:w-64 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible scrollbar-hide" style={{ minHeight: 'auto', gap: '8px', WebkitOverflowScrolling: 'touch' }}>
                  <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 mb-0 lg:mb-8">
                    {navigationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`whitespace-nowrap text-left py-2.5 lg:py-3 transition-colors text-sm lg:text-base touch-manipulation ${
                          activeSection === item.id
                            ? 'bg-[#8A63D2] text-white px-3 lg:px-4 rounded-lg'
                            : 'text-gray-400 active:bg-[#333333] sm:hover:bg-[#333333] px-3 lg:px-4 rounded-lg'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="whitespace-nowrap text-left py-2 lg:py-3 transition-colors text-sm lg:text-base text-white hover:text-gray-300 hover:bg-[#333333] px-3 lg:px-4 rounded-lg flex items-center lg:justify-start justify-center space-x-2 lg:mt-auto lg:pt-4"
                    >
                      <span>Выйти</span>
                      <svg className="w-4 h-4 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>

                {/* Основной контент */}
                <div className="flex-1 min-w-0">
                  {activeSection === 'data' && (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Аватар */}
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="flex-1 w-full">
                          <label className="block text-white text-sm font-medium mb-2">
                            Аватар
                          </label>
                          <p className="text-gray-400 text-sm">
                            Нажмите на картинку чтобы обновить<br className="hidden sm:block" />или удалить аватарку
                          </p>
                        </div>
                        <div className="w-20 h-20 sm:w-24 sm:h-24 relative flex-shrink-0">
                          {userProfile?.base64_image ? (
                            <img 
                              src={userProfile.base64_image} 
                              alt="Аватар"
                              className={`w-full h-full rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity ${
                                isUploadingAvatar ? 'opacity-50' : ''
                              }`}
                              onClick={handleAvatarClick}
                            />
                          ) : (
                            <div 
                              className={`w-full h-full rounded-full bg-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-500 transition-colors ${
                                isUploadingAvatar ? 'opacity-50' : ''
                              }`}
                              onClick={handleAvatarClick}
                            >
                              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                              </svg>
                            </div>
                          )}
                          
                          {/* Индикатор загрузки */}
                          {isUploadingAvatar && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Скрытый input для загрузки файла */}
                      <input
                        id="avatar-input"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />

                      {/* Никнейм */}
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Никнейм
                        </label>
                        <input
                          type="text"
                          value={formData.nickname}
                          onChange={(e) => handleInputChange('nickname', e.target.value)}
                          className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8A63D2] transition-colors"
                          placeholder="Введите никнейм"
                        />
                      </div>

                      {/* Почта */}
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Почта
                        </label>
                        <p className="text-gray-400 text-sm mb-2">Не редактируется</p>
                        <input
                          type="email"
                          value={userProfile?.email || ''}
                          disabled
                          className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white placeholder-gray-400 cursor-not-allowed opacity-60"
                        />
                      </div>

                      {/* Дата рождения */}
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Дата рождения
                        </label>
                        <input
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                          className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8A63D2] transition-colors"
                        />
                      </div>

                      {/* Страна */}
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Страна
                        </label>
                        <select
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#8A63D2] transition-colors appearance-none cursor-pointer"
                        >
                          <option value="Россия">Россия</option>
                          <option value="Беларусь">Беларусь</option>
                          <option value="Казахстан">Казахстан</option>
                          <option value="Украина">Украина</option>
                          <option value="Другая">Другая</option>
                        </select>
                      </div>

                      {/* Язык */}
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Язык
                        </label>
                        <select
                          value={formData.language}
                          onChange={(e) => handleInputChange('language', e.target.value)}
                          className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#8A63D2] transition-colors appearance-none cursor-pointer"
                        >
                          <option value="ru">Русский</option>
                          <option value="en">English</option>
                          <option value="de">Deutsch</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>

                      {/* Кнопки действий */}
                      <div className="flex justify-end space-x-4 pt-6">
                        <button
                          onClick={handleCancel}
                          className="px-6 py-3 bg-[#1A1826] border border-gray-600 text-white rounded-lg hover:bg-[#2A2A2A] transition-colors"
                        >
                          Отменить
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-6 py-3 bg-[#8A63D2] text-white rounded-lg hover:bg-[#7A53C2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSaving ? 'Сохранение...' : 'Сохранить'}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSection === 'history' && (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Фильтры */}
                      <div className="flex flex-col sm:flex-row gap-4 w-full">
                        <div className="flex-1 w-full min-w-0">
                          <label className="block text-white text-sm font-medium mb-2">
                            Выберите категорию
                          </label>
                          <select
                            value={historyFilters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#8A63D2] transition-colors appearance-none cursor-pointer text-sm sm:text-base"
                          >
                            <option value="">Все категории</option>
                            <option value="registration">Регистрация</option>
                            <option value="favorites">Подписки</option>
                            <option value="content">Контент</option>
                            <option value="subscription">Абонемент</option>
                          </select>
                        </div>
                        <div className="flex-1 w-full min-w-0">
                          <label className="block text-white text-sm font-medium mb-2">
                            Период
                          </label>
                          <div className="flex gap-2 items-center">
                            <input
                              type="date"
                              value={historyFilters.dateFrom}
                              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                              className="flex-1 min-w-0 px-2 sm:px-4 py-2 sm:py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#8A63D2] transition-colors text-sm sm:text-base"
                            />
                            <span className="text-white text-sm sm:text-base flex-shrink-0">-</span>
                            <input
                              type="date"
                              value={historyFilters.dateTo}
                              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                              className="flex-1 min-w-0 px-2 sm:px-4 py-2 sm:py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#8A63D2] transition-colors text-sm sm:text-base"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Список истории */}
                      <div className="space-y-3 sm:space-y-4">
                        {isLoadingHistory ? (
                          <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 py-3 border-b border-gray-700 animate-pulse">
                                <div className="h-4 bg-gray-600 rounded w-full sm:w-3/4"></div>
                                <div className="h-4 bg-gray-600 rounded w-1/2 sm:w-1/4"></div>
                              </div>
                            ))}
                          </div>
                        ) : historyItems.length > 0 ? (
                          <>
                            <div className="text-xs sm:text-sm text-gray-400 mb-2">
                              Загружено {historyItems.length} записей
                            </div>
                            {historyItems.map((item: any) => {
                              const getIcon = () => {
                                switch (item.type) {
                                  case 'user_registration':
                                    return (
                                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                      </svg>
                                    );
                                  case 'user_subscription':
                                    return (
                                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    );
                                  case 'post_created':
                                    return (
                                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    );
                                  case 'comment_created':
                                    return (
                                      <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                      </svg>
                                    );
                                  case 'subscription_activated':
                                    return (
                                      <svg className="w-5 h-5 text-[#8A63D2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    );
                                  default:
                                    return (
                                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    );
                                }
                              };

                              return (
                                <div 
                                  key={item.id} 
                                  className="flex items-start gap-3 sm:gap-4 py-3 border-b border-gray-700 hover:bg-[#2A2A2A]/50 transition-colors"
                                >
                                  <div className="flex-shrink-0 mt-0.5">
                                    {getIcon()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm sm:text-base break-words">
                                          {item.description}
                                        </p>
                                        {item.related_user && (
                                          <div className="flex items-center gap-2 mt-1">
                                            {item.related_user.avatar && (
                                              <img 
                                                src={item.related_user.avatar.startsWith('data:') 
                                                  ? item.related_user.avatar 
                                                  : `data:image/png;base64,${item.related_user.avatar}`}
                                                alt={item.related_user.fio}
                                                className="w-5 h-5 rounded-full object-cover"
                                              />
                                            )}
                                            <span className="text-gray-400 text-xs">
                                              {item.related_user.fio}
                                            </span>
                                          </div>
                                        )}
                                        {item.related_post && (
                                          <Link 
                                            href={`/posts/${item.related_post.id}`}
                                            className="text-[#8A63D2] hover:text-[#7A53C2] text-xs sm:text-sm mt-1 inline-block"
                                          >
                                            Перейти к посту →
                                          </Link>
                                        )}
                                      </div>
                                      <div className="flex flex-col items-end sm:items-end gap-1 flex-shrink-0">
                                        <span className="text-gray-400 text-xs sm:text-sm whitespace-nowrap">
                                          {formatDate(item.date)}
                                        </span>
                                        {item.time && (
                                          <span className="text-gray-500 text-xs whitespace-nowrap">
                                            {item.time}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </>
                        ) : (
                          <div className="text-center py-8 sm:py-12">
                            <div className="text-gray-400 text-base sm:text-lg">
                              История активности пуста
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSection === 'favorites' && (
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <h2 className="text-white text-xl font-semibold mb-4">
                          Мои подписки
                        </h2>
                        <p className="text-gray-400 text-sm mb-6">
                          Список авторов, на которых вы подписаны
                        </p>
                      </div>

                      {isLoadingSubscriptions ? (
                        <div className="space-y-3">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-[#2A2A2A] rounded-lg animate-pulse">
                              <div className="w-12 h-12 bg-gray-600 rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-600 rounded w-1/3 mb-2"></div>
                                <div className="h-3 bg-gray-600 rounded w-1/4"></div>
                              </div>
                              <div className="h-8 bg-gray-600 rounded w-24"></div>
                            </div>
                          ))}
                        </div>
                      ) : subscriptions.length > 0 ? (
                        <div className="space-y-3">
                          {subscriptions.map((subscription) => (
                            <div 
                              key={subscription.id || subscription.subscribed_to} 
                              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-[#2A2A2A] rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                            >
                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                {/* Аватар */}
                                <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
                                  {subscription.subscribed_to_avatar ? (
                                    <img 
                                      src={subscription.subscribed_to_avatar.startsWith('data:') 
                                        ? subscription.subscribed_to_avatar 
                                        : `data:image/png;base64,${subscription.subscribed_to_avatar}`}
                                      alt={subscription.subscribed_to_fio}
                                      className="w-full h-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full rounded-full bg-gray-600 flex items-center justify-center">
                                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                                      </svg>
                                    </div>
                                  )}
                                </div>

                                {/* Информация о пользователе */}
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-white font-medium text-base sm:text-lg truncate">
                                    {subscription.subscribed_to_fio || 'Пользователь'}
                                  </h3>
                                  {subscription.subscribed_to_nickname && (
                                    <p className="text-gray-400 text-sm truncate">
                                      @{subscription.subscribed_to_nickname}
                                    </p>
                                  )}
                                  {subscription.subscribed_to_rating !== undefined && (
                                    <p className="text-gray-500 text-xs mt-1">
                                      Рейтинг: {subscription.subscribed_to_rating}
                                    </p>
                                  )}
                                  {subscription.created_at && (
                                    <p className="text-gray-500 text-xs mt-1">
                                      Подписан с {formatDate(subscription.created_at)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Кнопка отписки */}
                              <button
                                onClick={() => handleUnsubscribe(
                                  subscription.subscribed_to, 
                                  subscription.subscribed_to_fio || 'пользователя'
                                )}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0"
                              >
                                Отписаться
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-gray-400 text-lg mb-2">
                            У вас пока нет подписок
                          </div>
                          <p className="text-gray-500 text-sm">
                            Подписывайтесь на авторов статей, чтобы видеть их контент первыми
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeSection === 'settings' && (
                    <div className="space-y-8">
                      {/* Язык интерфейса */}
                      <div>
                        <label className="block text-white text-sm font-medium mb-3">
                          Язык интерфейса
                        </label>
                        <select
                          value={settingsData.language}
                          onChange={(e) => handleSettingsChange('language', e.target.value)}
                          className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#8A63D2] transition-colors appearance-none cursor-pointer"
                        >
                          <option value="ru">Русский</option>
                          <option value="en">English</option>
                          <option value="de">Deutsch</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>

                      {/* Уведомления */}
                      <div>
                        <label className="block text-white text-sm font-medium mb-3">
                          Уведомления
                        </label>
                        <div className="space-y-3">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settingsData.notifications.email}
                              onChange={(e) => handleSettingsChange('notifications.email', e.target.checked)}
                              className="w-5 h-5 text-[#8A63D2] bg-[#2A2A2A] border-gray-600 rounded focus:ring-[#8A63D2] focus:ring-2"
                            />
                            <span className="text-white">Почта</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settingsData.notifications.internal}
                              onChange={(e) => handleSettingsChange('notifications.internal', e.target.checked)}
                              className="w-5 h-5 text-[#8A63D2] bg-[#2A2A2A] border-gray-600 rounded focus:ring-[#8A63D2] focus:ring-2"
                            />
                            <span className="text-white">Внутренние</span>
                          </label>
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settingsData.notifications.push}
                              onChange={(e) => handleSettingsChange('notifications.push', e.target.checked)}
                              className="w-5 h-5 text-[#8A63D2] bg-[#2A2A2A] border-gray-600 rounded focus:ring-[#8A63D2] focus:ring-2"
                            />
                            <span className="text-white">Пуш</span>
                          </label>
                        </div>
                      </div>

                      {/* Управление подпиской */}
                      <div>
                        <label className="block text-white text-sm font-medium mb-3">
                          Управление подпиской
                        </label>
                        {userProfile?.is_subscribed ? (
                          <div className="space-y-4">
                            <div className="text-gray-300">
                              Активно до {userProfile.subscribe_expired ? formatDate(userProfile.subscribe_expired) : 'не указано'}
                            </div>
                            <div className="flex space-x-3">
                              <button className="px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors">
                                Сменить план
                              </button>
                              <button className="px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors">
                                Отменить подписку
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="text-gray-300">
                              У вас нет активной подписки
                            </div>
                            <button 
                              onClick={handlePaySubscription}
                              className="px-6 py-3 bg-[#8A63D2] text-white rounded-lg hover:bg-[#7A53C2] transition-colors"
                            >
                              Оплатить
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Безопасность */}
                      <div>
                        <label className="block text-white text-sm font-medium mb-3">
                          Безопасность
                        </label>
                        <button 
                          onClick={handleChangePassword}
                          className="px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors"
                        >
                          Сменить пароль
                        </button>
                      </div>

                      {/* История платежей */}
                      <div>
                        <label className="block text-white text-sm font-medium mb-3">
                          История платежей
                        </label>
                        <button 
                          onClick={handleOpenPaymentHistory}
                          className="px-4 py-2 bg-[#2A2A2A] text-white rounded-lg hover:bg-[#3A3A3A] transition-colors"
                        >
                          Открыть
                        </button>
                      </div>

                      {/* Статус абонемента */}
                      {userProfile?.is_subscribed && (
                        <div>
                          <label className="block text-white text-sm font-medium mb-3">
                            Статус абонемента
                          </label>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-white">Активен</span>
                          </div>
                          
                          {/* Информационное сообщение */}
                          <div className="mt-4 p-4 bg-[#2A2A2A] border border-gray-600 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-white text-xs font-bold">i</span>
                              </div>
                              <div className="text-gray-300 text-sm">
                                Уведомления о предстоящем продлении или списании
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Кнопки действий */}
                      <div className="flex justify-end space-x-4 pt-6">
                        <button
                          onClick={handleCancelSettings}
                          className="px-6 py-3 bg-[#1A1826] border border-gray-600 text-white rounded-lg hover:bg-[#2A2A2A] transition-colors"
                        >
                          Отменить
                        </button>
                        <button
                          onClick={handleSaveSettings}
                          disabled={isSavingSettings}
                          className="px-6 py-3 bg-[#8A63D2] text-white rounded-lg hover:bg-[#7A53C2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSavingSettings ? 'Сохранение...' : 'Сохранить'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <>
        <Header activePage="profile" />
        <div 
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#090F1B' }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8A63D2]"></div>
        </div>
      </>
    }>
      <ProfileContent />
    </Suspense>
  );
}
