'use client';

import { useState, useEffect } from 'react';
import { getCategories } from '@/lib/api';

interface LeftSidebarProps {
  activeCategory?: string;
  onCategoryChange?: (category: string) => void;
}

interface Category {
  id: string;
  name: string;
}

export default function LeftSidebar({ activeCategory = 'all', onCategoryChange }: LeftSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback к статичным категориям
        setCategories([
          { id: 'all', name: 'Все' },
          { id: 'esoterics', name: 'Эзотерика' },
          { id: 'astrology', name: 'Астрология' },
          { id: 'tarot', name: 'Таро' },
          { id: 'numerology', name: 'Нумерология' },
          { id: 'meditation', name: 'Медитация' },
          { id: 'spirituality', name: 'Духовность' },
          { id: 'other', name: 'Другое' },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  if (isLoading) {
    return (
      <div 
        className="bg-[#1A1826] rounded-[32px] p-6 h-fit border"
        style={{ 
          width: '277px',
          borderWidth: '1px',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          boxShadow: '0px 0px 120px 0px rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="space-y-[10px]">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-gray-600 rounded-full animate-pulse"></div>
              <div className="w-20 h-4 bg-gray-600 rounded animate-pulse"></div>
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
        width: '277px',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0px 0px 120px 0px rgba(255, 255, 255, 0.1)'
      }}
    >
      <nav className="space-y-[10px]">
        {categories.map((category, index) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 text-left ${
              activeCategory === category.id
                ? 'bg-[#333333] text-white scale-105'
                : 'text-gray-300 hover:text-white hover:bg-[#2A2A2A] hover:scale-105'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <span className="text-xs">●</span>
            <span className="text-sm font-medium">{category.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
