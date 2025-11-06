'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface ArticleCardProps {
  id?: string;
  title: string;
  description: string;
  image?: string | null;
  rating: number;
  comments: number;
  views: number;
  category?: string;
  author?: string;
  authorAvatar?: string;
  createdAt?: string;
}

export default function ArticleCard({ 
  id,
  title, 
  description, 
  image, 
  rating, 
  comments, 
  views,
  category,
  author,
  authorAvatar,
  createdAt
}: ArticleCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (id) {
      router.push(`/posts/${id}`);
    }
  };

  // Функция для рендеринга inline markdown (жирный, курсив, подчеркивание)
  const renderInlineMarkdown = (text: string): React.ReactNode[] => {
    if (!text || typeof text !== 'string') return [text || ''];
    
    const result: React.ReactNode[] = [];
    let keyCounter = 0;
    
    // Разбиваем текст на части, обрабатывая markdown последовательно
    const processText = (input: string, depth: number = 0): React.ReactNode[] => {
      if (depth > 10) return [input]; // Защита от бесконечной рекурсии
      
      const parts: React.ReactNode[] = [];
      let remaining = input;
      let lastIndex = 0;
      
      // Находим все markdown элементы в порядке появления
      const allMatches: Array<{ start: number; end: number; type: string; content: string }> = [];
      
      // HTML теги подчеркивания
      const underlineRegex = /<u>(.*?)<\/u>/g;
      let match;
      while ((match = underlineRegex.exec(remaining)) !== null) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'u',
          content: match[1] || ''
        });
      }
      
      // Жирный текст **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      boldRegex.lastIndex = 0;
      while ((match = boldRegex.exec(remaining)) !== null) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          type: 'strong',
          content: match[1] || ''
        });
      }
      
      // Курсив *text* (только если не является частью **text**)
      const italicRegex = /\*([^*\n]+?)\*/g;
      italicRegex.lastIndex = 0;
      while ((match = italicRegex.exec(remaining)) !== null) {
        // Проверяем, что это не часть **text**
        const before = match.index > 0 ? remaining[match.index - 1] : '';
        const after = match.index + match[0].length < remaining.length ? remaining[match.index + match[0].length] : '';
        if (before !== '*' && after !== '*') {
          allMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            type: 'em',
            content: match[1] || ''
          });
        }
      }
      
      // Сортируем по позиции
      allMatches.sort((a, b) => a.start - b.start);
      
      // Удаляем перекрывающиеся (оставляем первые)
      const filteredMatches: typeof allMatches = [];
      let lastEnd = 0;
      allMatches.forEach(m => {
        if (m.start >= lastEnd) {
          filteredMatches.push(m);
          lastEnd = m.end;
        }
      });
      
      // Строим результат
      filteredMatches.forEach((m) => {
        // Текст до совпадения
        if (m.start > lastIndex) {
          const plainText = remaining.substring(lastIndex, m.start);
          if (plainText) {
            parts.push(...processText(plainText, depth + 1));
          }
        }
        
        // Обрабатываем markdown элемент
        switch (m.type) {
          case 'u':
            parts.push(
              <u key={`u-${keyCounter++}`} className="underline">
                {processText(m.content, depth + 1).map((node, idx) => <React.Fragment key={idx}>{node}</React.Fragment>)}
              </u>
            );
            break;
          case 'strong':
            parts.push(
              <strong key={`strong-${keyCounter++}`} className="font-bold">
                {processText(m.content, depth + 1).map((node, idx) => <React.Fragment key={idx}>{node}</React.Fragment>)}
              </strong>
            );
            break;
          case 'em':
            parts.push(
              <em key={`em-${keyCounter++}`} className="italic">{m.content}</em>
            );
            break;
        }
        
        lastIndex = m.end;
      });
      
      // Оставшийся текст
      if (lastIndex < remaining.length) {
        const plainText = remaining.substring(lastIndex);
        if (plainText) {
          parts.push(...processText(plainText, depth + 1));
        }
      }
      
      return parts.length > 0 ? parts : [remaining];
    };
    
    return processText(text);
  };
  return (
    <article 
      className="rounded-2xl sm:rounded-[32px] border mb-[10px] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl w-full p-4 sm:p-6 lg:p-8"
      style={{ 
        backgroundColor: '#00051B',
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        boxShadow: '0px 0px 120px 0px rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Заголовок и мета-информация */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-3 sm:mb-4 gap-2 sm:gap-0">
        <h2 
          className="text-base sm:text-lg lg:text-xl font-bold text-white flex-1 cursor-pointer hover:text-[#8A63D2] transition-colors"
          onClick={handleClick}
        >
          {renderInlineMarkdown(title).map((node, idx) => <React.Fragment key={idx}>{node}</React.Fragment>)}
        </h2>
        {category && (
          <span className="ml-0 sm:ml-4 px-2 sm:px-3 py-1 bg-[#8A63D2] text-white text-xs sm:text-sm rounded-full whitespace-nowrap">
            {category}
          </span>
        )}
      </div>
      
      {/* Автор и дата */}
      {(author || createdAt) && (
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4">
          {author && (
            <span className="flex items-center space-x-2">
              {authorAvatar ? (
                <img 
                  src={authorAvatar} 
                  alt={author}
                  className="w-4 h-4 rounded-full object-cover"
                />
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              )}
              <span>{author}</span>
            </span>
          )}
          {createdAt && (
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(createdAt).toLocaleDateString('ru-RU')}</span>
            </span>
          )}
        </div>
      )}
      
      <div className="text-gray-300 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">
        {renderInlineMarkdown(description).map((node, idx) => <React.Fragment key={idx}>{node}</React.Fragment>)}
      </div>
      
      {image && (
        <div className="mb-3 sm:mb-4">
          <img 
            src={image} 
            alt={title}
            className="w-full h-32 sm:h-40 lg:h-48 object-cover rounded-lg"
          />
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <button 
          onClick={handleClick}
          className="text-white hover:text-[#8A63D2] transition-colors font-medium"
        >
          Читать далее
        </button>
        
        <div className="flex items-center space-x-4 text-gray-400">
          {/* Рейтинг */}
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i} 
                className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-sm text-gray-400 ml-1">{rating.toFixed(1)}</span>
          </div>
          
          {/* Комментарии */}
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-sm">{comments}</span>
          </div>
          
          {/* Просмотры */}
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span className="text-sm">{views}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
