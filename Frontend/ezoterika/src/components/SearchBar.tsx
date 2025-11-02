'use client';

import { useState } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div className="mb-8 mx-auto" style={{ width: '893px' }}>
      <form onSubmit={handleSubmit} className="flex items-center justify-between rounded-[12px]" style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        padding: '16px 20px',
        height: '52px',
        gap: '4px'
      }}>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder="Поиск по авторам, ключевым словам и типу контента"
          className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none transition-colors"
          style={{ fontSize: '14px' }}
        />
        <button
          type="submit"
          className="text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>
    </div>
  );
}
