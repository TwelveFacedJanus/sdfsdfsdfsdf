// API Configuration
// In browser, use relative URL to hit Next.js proxy
// In server-side, use the full backend URL
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use Next.js proxy
    return '';
  }
  // Server-side: use backend URL
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiBaseUrl();

// API Endpoints
export const API_ENDPOINTS = {
  USER: {
    SIGN_UP: `${API_BASE_URL}/api/user/sign-up/`,
    SIGN_IN: `${API_BASE_URL}/api/user/sign-in/`,
    PROFILE: `${API_BASE_URL}/api/user/profile/`,
    HISTORY: `${API_BASE_URL}/api/user/history/`,
    SETTINGS: `${API_BASE_URL}/api/user/settings/`,
    CHANGE_PASSWORD: `${API_BASE_URL}/api/user/change-password/`,
    PAYMENT_HISTORY: `${API_BASE_URL}/api/user/payment-history/`,
    TOKEN_REFRESH: `${API_BASE_URL}/api/user/token/refresh/`,
    LOGOUT: `${API_BASE_URL}/api/user/logout/`,
    TOP_USERS: `${API_BASE_URL}/api/user/top-users/`,
  },
  CONTENT: {
    POSTS: `${API_BASE_URL}/api/content/posts/`,
    POST_DETAIL: `${API_BASE_URL}/api/content/posts/`,
    CREATE_POST: `${API_BASE_URL}/api/content/posts/create/`,
    UPLOAD_IMAGE: `${API_BASE_URL}/api/content/upload-image/`,
    TOP_POSTS: `${API_BASE_URL}/api/content/top-posts/`,
    COMMENTS: `${API_BASE_URL}/api/content/comments/`,
  },
} as const;

// Types
export interface RegistrationData {
  fio: string;
  email: string;
  password: string;
  password_confirm: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ApiResponse {
  message?: string;
  user?: any;
  tokens?: {
    access: string;
    refresh: string;
  };
  error?: string;
  details?: any;
}

// API Functions
export const apiRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const { accessToken, refreshToken } = getStoredTokens();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  // Добавляем токен авторизации если он есть
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(url, {
    headers,
    ...options,
  });

  // Если получили 401, пытаемся обновить токен
  if (response.status === 401 && refreshToken) {
    try {
      const refreshResponse = await fetch(API_ENDPOINTS.USER.TOKEN_REFRESH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setStoredTokens(refreshData.access, refreshToken);
        
        // Повторяем оригинальный запрос с новым токеном
        headers['Authorization'] = `Bearer ${refreshData.access}`;
        response = await fetch(url, {
          headers,
          ...options,
        });
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Если обновление токена не удалось, перенаправляем на страницу входа
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        window.location.href = '/signIn';
      }
    }
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
};

// Auth Functions
export const registerUser = async (data: RegistrationData): Promise<ApiResponse> => {
  return apiRequest<ApiResponse>(API_ENDPOINTS.USER.SIGN_UP, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const loginUser = async (data: LoginData): Promise<ApiResponse> => {
  return apiRequest<ApiResponse>(API_ENDPOINTS.USER.SIGN_IN, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

// Token Management
export const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

export const getStoredTokens = (): { accessToken: string | null; refreshToken: string | null } => {
  if (typeof window !== 'undefined') {
    return {
      accessToken: localStorage.getItem('access_token'),
      refreshToken: localStorage.getItem('refresh_token')
    };
  }
  return { accessToken: null, refreshToken: null };
};

export const setStoredTokens = (accessToken: string, refreshToken: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }
};

export const clearStoredTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

// User Data Management
export const setUserData = (userData: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user_data', JSON.stringify(userData));
  }
};

export const getUserData = (): any => {
  if (typeof window !== 'undefined') {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
  return null;
};

export const clearUserData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_data');
  }
};

// Content API Functions
export const getCategories = async (): Promise<{ id: string; name: string }[]> => {
  // Возвращаем категории из модели Post
  const categories = [
    { id: 'all', name: 'Все' },
    { id: 'esoterics', name: 'Эзотерика' },
    { id: 'astrology', name: 'Астрология' },
    { id: 'tarot', name: 'Таро' },
    { id: 'numerology', name: 'Нумерология' },
    { id: 'meditation', name: 'Медитация' },
    { id: 'spirituality', name: 'Духовность' },
    { id: 'other', name: 'Другое' },
  ];
  
  return categories;
};

export const getPosts = async (category?: string, search?: string, page: number = 1, pageSize: number = 4): Promise<any> => {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (search) params.append('search', search);
  params.append('page', page.toString());
  params.append('page_size', pageSize.toString());
  
  const url = `${API_ENDPOINTS.CONTENT.POSTS}${params.toString() ? `?${params.toString()}` : ''}`;
  return apiRequest(url, {
    method: 'GET',
  });
};

export const getPostDetail = async (postId: string): Promise<any> => {
  return apiRequest(`${API_ENDPOINTS.CONTENT.POST_DETAIL}${postId}/`, {
    method: 'GET',
  });
};

export const getUserProfile = async (): Promise<any> => {
  return apiRequest(API_ENDPOINTS.USER.PROFILE, {
    method: 'GET',
  });
};

export const getUserHistory = async (category?: string, dateFrom?: string, dateTo?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);
  
  const queryString = params.toString();
  const url = queryString ? `${API_ENDPOINTS.USER.HISTORY}?${queryString}` : API_ENDPOINTS.USER.HISTORY;
  
  return apiRequest(url, {
    method: 'GET',
  });
};

export const getUserSettings = async (): Promise<any> => {
  return apiRequest(`${API_ENDPOINTS.USER.SETTINGS}`, {
    method: 'GET',
  });
};

export const updateUserSettings = async (settingsData: any): Promise<any> => {
  return apiRequest(`${API_ENDPOINTS.USER.SETTINGS}`, {
    method: 'PATCH',
    body: JSON.stringify(settingsData),
  });
};

export const changePassword = async (currentPassword: string, newPassword: string): Promise<any> => {
  return apiRequest(`${API_ENDPOINTS.USER.CHANGE_PASSWORD}`, {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword
    }),
  });
};

export const getPaymentHistory = async (): Promise<any> => {
  return apiRequest(`${API_ENDPOINTS.USER.PAYMENT_HISTORY}`, {
    method: 'GET',
  });
};

export const uploadImage = async (imageData: string): Promise<any> => {
  return apiRequest(`${API_ENDPOINTS.CONTENT.UPLOAD_IMAGE}`, {
    method: 'POST',
    body: JSON.stringify({ image: imageData }),
  });
};

export const createContent = async (contentData: any): Promise<any> => {
  return apiRequest(`${API_ENDPOINTS.CONTENT.CREATE_POST}`, {
    method: 'POST',
    body: JSON.stringify(contentData),
  });
};

// Comments API
export const getComments = async (postId: string, sortOrder: 'newest' | 'oldest' = 'newest'): Promise<any> => {
  const params = new URLSearchParams();
  params.append('post_id', postId);
  params.append('sort', sortOrder);
  
  return apiRequest(`${API_ENDPOINTS.CONTENT.COMMENTS}?${params.toString()}`, {
    method: 'GET',
  });
};

export const createComment = async (postId: string, text: string): Promise<any> => {
  return apiRequest(`${API_ENDPOINTS.CONTENT.COMMENTS}create/`, {
    method: 'POST',
    body: JSON.stringify({
      post_id: postId,
      text: text
    }),
  });
};

export const createReply = async (parentId: string, text: string): Promise<any> => {
  return apiRequest(`${API_ENDPOINTS.CONTENT.COMMENTS}create/`, {
    method: 'POST',
    body: JSON.stringify({
      parent_id: parentId,
      text: text
    }),
  });
};

export const updateUserProfile = async (profileData: any): Promise<any> => {
  return apiRequest(API_ENDPOINTS.USER.PROFILE, {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  });
};

export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Проверяем размер файла (максимум 2MB)
    if (file.size > 2 * 1024 * 1024) {
      reject(new Error('Размер файла не должен превышать 2MB'));
      return;
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      reject(new Error('Файл должен быть изображением'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error('Ошибка при чтении файла'));
    };
    reader.readAsDataURL(file);
  });
};

export const getTopUsers = async (limit: number = 3): Promise<any[]> => {
  try {
    const response = await apiRequest(`${API_ENDPOINTS.USER.TOP_USERS}?limit=${limit}`, { method: 'GET' });
    return response.users || [];
  } catch (error) {
    console.error('Error loading top users:', error);
    // Fallback к моковым данным при ошибке
    const mockUsers = [
      { id: '1', fio: 'Анна Иванова', rating: 4.9 },
      { id: '2', fio: 'Михаил Петров', rating: 4.8 },
      { id: '3', fio: 'Елена Сидорова', rating: 4.7 },
    ];
    return mockUsers.slice(0, limit);
  }
};
