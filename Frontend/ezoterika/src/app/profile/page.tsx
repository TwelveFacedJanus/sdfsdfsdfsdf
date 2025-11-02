'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStoredTokens, getUserData, updateUserProfile, convertFileToBase64, getUserProfile, getUserHistory, getUserSettings, updateUserSettings, changePassword, getPaymentHistory } from '@/lib/api';
import Header from '@/components/Header';

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
      // Fallback к моковым данным при ошибке API
      const mockHistory = [
        {
          id: 1,
          description: '«Активирован абонемент»',
          date: '2025-08-15',
          category: 'subscription'
        },
        {
          id: 2,
          description: '«Участие в Лайве: Таро-практика»',
          date: '2025-07-20',
          category: 'live'
        },
        {
          id: 3,
          description: '«Пожертвование 5 € практику А»',
          date: '2025-08-15',
          category: 'donation'
        },
        {
          id: 4,
          description: '«Скачан файл: Годовой прогноз PDF»',
          date: '2025-08-02',
          category: 'download'
        },
        {
          id: 5,
          description: '«Просмотр статьи: Основы астрологии»',
          date: '2025-07-28',
          category: 'content'
        },
        {
          id: 6,
          description: '«Добавлено в избранное: Карты Таро»',
          date: '2025-07-25',
          category: 'favorites'
        }
      ];

      // Фильтрация моковых данных
      let filteredHistory = mockHistory;
      if (historyFilters.category) {
        filteredHistory = mockHistory.filter(item => item.category === historyFilters.category);
      }
      if (historyFilters.dateFrom) {
        filteredHistory = filteredHistory.filter(item => item.date >= historyFilters.dateFrom);
      }
      if (historyFilters.dateTo) {
        filteredHistory = filteredHistory.filter(item => item.date <= historyFilters.dateTo);
      }

      setHistoryItems(filteredHistory);
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
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Заголовок */}
            <h1 className="text-white mb-6" style={{ fontSize: '52px', fontWeight: 600, lineHeight: '120%', letterSpacing: '0%' }}>Профиль</h1>
            
            <div className="bg-[#1A1826] rounded-lg p-8" style={{ width: '886px' }}>
              <div className="flex gap-8">
                {/* Левая навигация */}
                <div className="w-64 flex flex-col" style={{ minHeight: '600px' }}>
                  <nav className="space-y-2 mb-8">
                    {navigationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full text-left py-3 transition-colors ${
                          activeSection === item.id
                            ? 'bg-[#8A63D2] text-white px-4 rounded-lg'
                            : 'text-gray-400 hover:bg-[#333333] px-4 rounded-lg'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 text-white hover:text-gray-300 transition-colors mt-auto pt-8"
                  >
                    <span>Выйти</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Основной контент */}
                <div className="flex-1">
                  {activeSection === 'data' && (
                    <div className="space-y-6">
                      {/* Аватар */}
                      <div className="flex items-start space-x-4">
                        <div className="flex-1">
                          <label className="block text-white text-sm font-medium mb-2">
                            Аватар
                          </label>
                          <p className="text-gray-400 text-sm">
                            Нажмите на картинку чтобы обновить<br />или удалить аватарку
                          </p>
                        </div>
                        <div className="w-24 h-24 relative">
                          {userProfile?.base64_image ? (
                            <img 
                              src={userProfile.base64_image} 
                              alt="Аватар"
                              className={`w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity ${
                                isUploadingAvatar ? 'opacity-50' : ''
                              }`}
                              onClick={handleAvatarClick}
                            />
                          ) : (
                            <div 
                              className={`w-24 h-24 rounded-full bg-gray-600 flex items-center justify-center cursor-pointer hover:bg-gray-500 transition-colors ${
                                isUploadingAvatar ? 'opacity-50' : ''
                              }`}
                              onClick={handleAvatarClick}
                            >
                              <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
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
                    <div className="space-y-6">
                      {/* Фильтры */}
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-white text-sm font-medium mb-2">
                            Выберите категорию
                          </label>
                          <select
                            value={historyFilters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="w-full px-4 py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#8A63D2] transition-colors appearance-none cursor-pointer"
                          >
                            <option value="">Все категории</option>
                            <option value="subscription">Подписки</option>
                            <option value="live">Лайвы</option>
                            <option value="donation">Пожертвования</option>
                            <option value="download">Загрузки</option>
                            <option value="content">Контент</option>
                            <option value="favorites">Избранное</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-white text-sm font-medium mb-2">
                            Период
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={historyFilters.dateFrom}
                              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                              className="flex-1 px-4 py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#8A63D2] transition-colors"
                            />
                            <span className="text-white self-center">-</span>
                            <input
                              type="date"
                              value={historyFilters.dateTo}
                              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                              className="flex-1 px-4 py-3 bg-[#2A2A2A] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#8A63D2] transition-colors"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Список истории */}
                      <div className="space-y-4">
                        {isLoadingHistory ? (
                          <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                              <div key={i} className="flex justify-between items-center py-3 border-b border-gray-700 animate-pulse">
                                <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                              </div>
                            ))}
                          </div>
                        ) : historyItems.length > 0 ? (
                          <>
                            <div className="text-sm text-gray-400 mb-2">
                              Загружено {historyItems.length} записей из API
                            </div>
                            {historyItems.map((item) => (
                              <div key={item.id} className="flex justify-between items-center py-3 border-b border-gray-700">
                                <span className="text-white">{item.description}</span>
                                <span className="text-gray-400 text-sm">{formatDate(item.date)}</span>
                              </div>
                            ))}
                          </>
                        ) : (
                          <div className="text-center py-12">
                            <div className="text-gray-400 text-lg">
                              История активности пуста
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeSection === 'favorites' && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-lg">
                        Избранное будет добавлено позже
                      </div>
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
