'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredTokens, getPosts } from '@/lib/api';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import ArticleCard from '@/components/ArticleCard';

interface Post {
  id: string;
  title: string;
  preview_text: string;
  preview_image_link?: string;
  rating: string;
  comments_count: number;
  views_count: number;
  category: string;
  category_display: string;
  author_fio: string;
  author_nickname?: string;
  author_rating: number;
  author_avatar?: string;
  created_at: string;
  is_published: boolean;
}

export default function ContentsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const pageSize = 4;

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      // Если нет токена, перенаправляем на страницу входа
      router.push('/signIn');
    } else {
      setIsLoading(false);
      loadPosts();
    }
  }, [router]);

  useEffect(() => {
    if (!isLoading) {
      setCurrentPage(1); // Сбрасываем на первую страницу при изменении фильтров
      loadPosts();
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    if (!isLoading && currentPage > 0) {
      loadPosts();
    }
  }, [currentPage]);

  const loadPosts = async () => {
    setPostsLoading(true);
    try {
      const response = await getPosts(
        activeCategory === 'all' ? undefined : activeCategory, 
        searchQuery || undefined,
        currentPage,
        pageSize
      );
      setPosts(response.posts || []);
      setTotalPages(response.total_pages || 1);
      setTotalPosts(response.total_count || 0);
    } catch (error) {
      console.error('Error loading posts:', error);
      setPosts([]);
      setTotalPages(1);
      setTotalPosts(0);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#282440] flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  return (
    <>
      <Header activePage="contents" />
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed"
        style={{ 
          backgroundImage: "url('/BG.png')",
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4 py-8">
          {/* Кнопка создания контента */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => router.push('/create-content')}
              className="flex items-center space-x-2 px-6 py-3 bg-[#8A63D2] text-white rounded-lg hover:bg-[#7A53C2] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Создать контент</span>
            </button>
          </div>

          {/* Поиск */}
          <SearchBar onSearch={handleSearch} />
          
          {/* Основной контент */}
          <div className="flex gap-6">
            {/* Левая боковая панель */}
            <LeftSidebar 
              activeCategory={activeCategory} 
              onCategoryChange={handleCategoryChange}
            />
            
            {/* Центральная часть с статьями */}
            <div className="flex-1">
              {postsLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-[#1A1826] rounded-lg p-6 animate-pulse">
                      <div className="h-6 bg-gray-600 rounded w-3/4 mb-3"></div>
                      <div className="h-4 bg-gray-600 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-600 rounded w-5/6 mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-600 rounded w-20"></div>
                        <div className="h-4 bg-gray-600 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : posts.length > 0 ? (
                <>
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <ArticleCard
                        key={post.id}
                        id={post.id}
                        title={post.title}
                        description={post.preview_text}
                        image={post.preview_image_link || "/api/placeholder/600/200"}
                        rating={parseFloat(post.rating)}
                        comments={post.comments_count}
                        views={post.views_count}
                        category={post.category_display}
                        author={post.author_fio}
                        authorAvatar={post.author_avatar}
                        createdAt={post.created_at}
                      />
                    ))}
                  </div>
                  
                  {/* Пагинация */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                      <div className="text-gray-400 text-sm">
                        Показано {posts.length} из {totalPosts} постов
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Кнопка "Предыдущая" */}
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage === 1}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === 1
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-[#8A63D2] text-white hover:bg-[#7A53C2]'
                          }`}
                        >
                          Предыдущая
                        </button>
                        
                        {/* Номера страниц */}
                        <div className="flex space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                  currentPage === pageNum
                                    ? 'bg-[#8A63D2] text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                        </div>
                        
                        {/* Кнопка "Следующая" */}
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === totalPages
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                              : 'bg-[#8A63D2] text-white hover:bg-[#7A53C2]'
                          }`}
                        >
                          Следующая
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-[#1A1826] rounded-lg p-8 text-center">
                  <div className="text-gray-400 text-lg mb-2">
                    {searchQuery ? 'Посты не найдены' : 'Нет постов в этой категории'}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {searchQuery 
                      ? `По запросу "${searchQuery}" ничего не найдено`
                      : 'Попробуйте выбрать другую категорию'
                    }
                  </div>
                </div>
              )}
            </div>
            
            {/* Правая боковая панель */}
            <RightSidebar />
          </div>
        </div>
      </div>
    </>
  );
}
