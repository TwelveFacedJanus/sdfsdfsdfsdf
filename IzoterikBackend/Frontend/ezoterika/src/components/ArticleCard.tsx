'use client';

'use client';

import { useRouter } from 'next/navigation';

interface ArticleCardProps {
  id?: string;
  title: string;
  description: string;
  image: string;
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
  return (
    <article className="bg-[#1A1826] rounded-lg p-6 mb-6">
      {/* Заголовок и мета-информация */}
      <div className="flex justify-between items-start mb-4">
        <h2 
          className="text-xl font-bold text-white flex-1 cursor-pointer hover:text-[#8A63D2] transition-colors"
          onClick={handleClick}
        >
          {title}
        </h2>
        {category && (
          <span className="ml-4 px-3 py-1 bg-[#8A63D2] text-white text-sm rounded-full">
            {category}
          </span>
        )}
      </div>
      
      {/* Автор и дата */}
      {(author || createdAt) && (
        <div className="flex items-center space-x-4 text-gray-400 text-sm mb-4">
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
      
      <p className="text-gray-300 mb-4 leading-relaxed">
        {description}
      </p>
      
      <div className="mb-4">
        <img 
          src={image} 
          alt={title}
          className="w-full h-48 object-cover rounded-lg"
        />
      </div>
      
      <div className="flex items-center justify-between">
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
