'use client';

import { useState, useEffect } from 'react';
import { getTopUsers } from '@/lib/api';

interface User {
  id: string;
  fio: string;
  rating: number;
  base64_image?: string;
}

export default function RightSidebar() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTopUsers = async () => {
      try {
        const topUsers = await getTopUsers(3);
        setUsers(topUsers);
      } catch (error) {
        console.error('Error loading top users:', error);
        // Fallback к статичным данным
        setUsers([
          { id: '1', fio: 'Анна Иванова', rating: 4.9 },
          { id: '2', fio: 'Михаил Петров', rating: 4.8 },
          { id: '3', fio: 'Елена Сидорова', rating: 4.7 },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopUsers();
  }, []);

  if (isLoading) {
    return (
      <div 
        className="bg-[#1A1826] rounded-[32px] p-6 h-fit border"
        style={{ 
          width: '431px',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0px 0px 120px 0px rgba(255, 255, 255, 0.1)'
        }}
      >
        <h3 className="text-lg font-bold text-white mb-4">
          Топ практиков
        </h3>
        <div className="space-y-[10px]">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gray-600 rounded animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-600 rounded-full animate-pulse"></div>
              <div className="w-24 h-4 bg-gray-600 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-[#00051B] rounded-[32px] p-6 h-fit border"
      style={{ 
        width: '431px',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0px 0px 120px 0px rgba(255, 255, 255, 0.1)'
      }}
    >
      <h3 className="text-lg font-bold text-white mb-4">
        Топ практиков
      </h3>
      
      <div className="space-y-[10px]">
        {users.map((user, index) => (
          <div key={user.id} className="flex items-center space-x-3">
            <span className="text-sm font-bold text-[#8A63D2] w-6">
              {index + 1}
            </span>
            {user.base64_image ? (
              <img 
                src={user.base64_image} 
                alt={user.fio}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
            )}
            <div className="flex-1">
              <span className="text-sm text-white block">
                {user.fio}
              </span>
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs text-gray-400">{user.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <a 
          href="#" 
          className="text-white hover:text-[#8A63D2] transition-colors text-sm"
        >
          Читать далее
        </a>
      </div>
    </div>
  );
}
