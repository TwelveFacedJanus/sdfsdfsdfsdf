'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getStoredTokens, getPostDetail, checkSubscriptionStatus, subscribeToUser, unsubscribeFromUser, getUserData } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Comments from '@/components/Comments';

interface ContentBlock {
  type: 'section' | 'text' | 'pdf' | 'image' | 'audio';
  title: string;
  description: string;
  image?: string | null;
  image_caption?: string;
  files?: Array<{
    name: string;
    size: number;
    type: string;
  }> | null;
}

interface PostDetail {
  id: string;
  title: string;
  preview_text: string;
  content: string;
  preview_image_link?: string;
  rating: string;
  comments_count: number;
  views_count: number;
  category: string;
  category_display: string;
  author: string; // ID автора
  author_fio: string;
  author_nickname?: string;
  author_rating: number;
  author_avatar?: string;
  created_at: string;
  updated_at: string;
  is_published: boolean;
}

export default function PostDetailPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState<PostDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      router.push('/signIn');
      return;
    }

    // Получаем ID текущего пользователя
    const userData = getUserData();
    if (userData && userData.id) {
      setCurrentUserId(userData.id);
    }

    if (postId) {
      loadPost();
    }
  }, [postId, router]);

  const parseContent = (contentString: string): ContentBlock[] => {
    try {
      // Пытаемся распарсить как JSON (старый формат)
      const parsed = JSON.parse(contentString);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      // Если не JSON, значит это markdown - парсим его
      return parseMarkdownToBlocks(contentString);
    }
  };

  const parseMarkdownToBlocks = (markdown: string): ContentBlock[] => {
    const blocks: ContentBlock[] = [];
    if (!markdown || !markdown.trim()) return blocks;

    // Разделяем по разделителю "---"
    const sections = markdown.split(/\n*---\s*\n*/).filter(s => s.trim());
    
    sections.forEach(section => {
      const lines = section.split('\n').filter(l => l.trim());
      let currentBlock: ContentBlock | null = null;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Проверяем на заголовок H2
        if (line.startsWith('## ')) {
          if (currentBlock && currentBlock.type === 'section') {
            blocks.push(currentBlock);
          }
          currentBlock = {
            type: 'section',
            title: line.replace('## ', '').trim(),
            description: ''
          };
        }
        // Проверяем на изображение в markdown
        else if (line.startsWith('![')) {
          const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
          if (imageMatch) {
            if (!currentBlock) {
              currentBlock = {
                type: 'section',
                title: '',
                description: ''
              };
            }
            currentBlock.image = imageMatch[2];
            currentBlock.image_caption = imageMatch[1];
            // Если блок еще не имеет типа, устанавливаем section
            if (!currentBlock.type || currentBlock.type === 'text') {
              currentBlock.type = 'section';
            }
          }
        }
        // Проверяем на ссылку (аудио)
        else if (line.startsWith('[🎵')) {
          const linkMatch = line.match(/\[🎵\s*([^\]]+)\]\(([^)]+)\)/);
          if (linkMatch) {
            if (!currentBlock || currentBlock.type !== 'pdf') {
              if (currentBlock) blocks.push(currentBlock);
              currentBlock = {
                type: 'pdf',
                title: linkMatch[1],
                description: '',
                files: [{
                  name: linkMatch[1],
                  size: 0,
                  type: 'audio/mpeg'
                }]
              };
            } else {
              currentBlock.files = currentBlock.files || [];
              currentBlock.files.push({
                name: linkMatch[1],
                size: 0,
                type: 'audio/mpeg'
              });
            }
          }
        }
        // Обычный текст
        else if (line.trim()) {
          if (!currentBlock) {
            currentBlock = {
              type: 'text',
              title: '',
              description: line
            };
          } else {
            if (currentBlock.description) {
              currentBlock.description += '\n' + line;
            } else {
              currentBlock.description = line;
            }
          }
        }
      }
      
      if (currentBlock) {
        blocks.push(currentBlock);
      }
    });
    
    return blocks;
  };

  const loadPost = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getPostDetail(postId);
      console.log('Full response:', response); // Отладка
      
      // API возвращает {post: {...}}, поэтому извлекаем post
      const postData = response.post || response;
      console.log('Post data:', postData); // Отладка
      setPost(postData);
      
      // Парсим контент
      if (postData.content) {
        console.log('Raw content:', postData.content); // Отладка
        const blocks = parseContent(postData.content);
        console.log('Parsed blocks:', blocks); // Отладка
        setContentBlocks(blocks);
      } else {
        console.log('No content in response'); // Отладка
      }

      // Проверяем статус подписки, если есть автор
      // Получаем currentUserId из localStorage, так как он может быть еще не установлен в state
      const userData = getUserData();
      const userId = userData?.id || currentUserId;
      
      if (postData.author && userId && postData.author !== userId) {
        try {
          const statusResponse = await checkSubscriptionStatus(postData.author);
          setIsSubscribed(statusResponse.is_subscribed || false);
        } catch (error) {
          console.error('Error checking subscription status:', error);
          setIsSubscribed(false);
        }
      }
    } catch (error) {
      console.error('Error loading post:', error);
      setError('Ошибка загрузки поста');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  const handleSubscribe = async () => {
    if (!post || !post.author) return;
    
    // Получаем ID текущего пользователя
    const userData = getUserData();
    const userId = userData?.id || currentUserId;
    
    // Не позволяем подписаться на самого себя
    if (!userId || userId === post.author) {
      return;
    }

    setIsSubscriptionLoading(true);
    try {
      if (isSubscribed) {
        await unsubscribeFromUser(post.author);
        setIsSubscribed(false);
      } else {
        await subscribeToUser(post.author);
        setIsSubscribed(true);
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      setError(error.message || 'Ошибка при изменении подписки');
    } finally {
      setIsSubscriptionLoading(false);
    }
  };

  const renderContentBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'section':
        return (
          <div key={index} id={`block-${index}`} className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              {block.title}
            </h2>
            {block.description && (
              <div className="text-lg text-gray-300 mb-6 whitespace-pre-wrap leading-relaxed">
                {block.description.split('\n').map((line, idx) => {
                  // Обработка markdown форматирования
                  if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                    const text = line.trim().replace(/\*\*/g, '');
                    return <p key={idx} className="font-bold mb-2">{text}</p>;
                  } else if (line.trim().startsWith('*') && line.trim().endsWith('*') && !line.trim().startsWith('**')) {
                    const text = line.trim().replace(/\*/g, '');
                    return <p key={idx} className="italic mb-2">{text}</p>;
                  } else if (line.trim().startsWith('<u>') && line.trim().endsWith('</u>')) {
                    const text = line.trim().replace(/<\/?u>/g, '');
                    return <p key={idx} className="underline mb-2">{text}</p>;
                  } else if (line.trim().startsWith('- ')) {
                    return <p key={idx} className="mb-1 ml-4">• {line.trim().substring(2)}</p>;
                  } else {
                    return <p key={idx} className="mb-2">{line || '\u00A0'}</p>;
                  }
                })}
              </div>
            )}
            {block.image && (
              <div className="mb-6">
                <img 
                  src={block.image} 
                  alt={block.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {block.image_caption && (
                  <p className="text-sm text-gray-400 mt-2 text-center">
                    {block.image_caption}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <div key={index} id={`block-${index}`} className="mb-8">
            {block.title && (
              <h3 className="text-2xl font-semibold text-white mb-4">
                {block.title}
              </h3>
            )}
            <div className="prose prose-invert max-w-none">
              <div className="text-white leading-relaxed whitespace-pre-wrap text-lg">
                {block.description.split('\n').map((line, idx) => {
                  // Обработка markdown форматирования
                  if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                    const text = line.trim().replace(/\*\*/g, '');
                    return <p key={idx} className="font-bold mb-2">{text}</p>;
                  } else if (line.trim().startsWith('*') && line.trim().endsWith('*') && !line.trim().startsWith('**')) {
                    const text = line.trim().replace(/\*/g, '');
                    return <p key={idx} className="italic mb-2">{text}</p>;
                  } else if (line.trim().startsWith('<u>') && line.trim().endsWith('</u>')) {
                    const text = line.trim().replace(/<\/?u>/g, '');
                    return <p key={idx} className="underline mb-2">{text}</p>;
                  } else if (line.trim().startsWith('- ')) {
                    return <p key={idx} className="mb-1 ml-4">• {line.trim().substring(2)}</p>;
                  } else {
                    return <p key={idx} className="mb-2">{line || '\u00A0'}</p>;
                  }
                })}
              </div>
            </div>
            {block.image && (
              <div className="mt-6">
                <img 
                  src={block.image} 
                  alt={block.title || 'Изображение'}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {block.image_caption && (
                  <p className="text-sm text-gray-400 mt-2 text-center">
                    {block.image_caption}
                  </p>
                )}
              </div>
            )}
          </div>
        );

      case 'pdf':
      case 'audio':
        return (
          <div key={index} id={`block-${index}`} className="mb-8">
            <div className="bg-[#2A1F3D] rounded-lg p-6 border border-gray-600">
              <div className="flex items-center space-x-3 mb-4">
                {block.type === 'audio' ? (
                  <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18V5L21 3V16" />
                    <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {block.title || (block.type === 'audio' ? 'Аудио файлы' : 'PDF Документ')}
                  </h3>
                  {block.description && (
                    <p className="text-gray-300 text-sm">
                      {block.description}
                    </p>
                  )}
                </div>
              </div>
              {block.files && block.files.length > 0 && (
                <div className="space-y-2">
                  {block.files.map((file, fileIndex) => (
                    <div key={fileIndex} className="flex items-center justify-between bg-[#1A1826] rounded p-3">
                      <div className="flex items-center space-x-3">
                        {block.type === 'audio' ? (
                          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18V5L21 3V16" />
                            <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                            <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" fill="none" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="text-white text-sm">{file.name}</span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {file.size > 0 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Аудио файл'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'image':
        return (
          <div key={index} id={`block-${index}`} className="mb-8">
            {block.image && (
              <div className="mb-6">
                <img 
                  src={block.image} 
                  alt={block.title || 'Изображение'}
                  className="w-full h-64 object-cover rounded-lg"
                />
                {block.image_caption && (
                  <p className="text-sm text-gray-400 mt-2 text-center">
                    {block.image_caption}
                  </p>
                )}
              </div>
            )}
            {block.title && (
              <h3 className="text-2xl font-semibold text-white mb-4">
                {block.title}
              </h3>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
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
          <div className="max-w-7xl mx-auto">
            <div className="flex gap-8">
              <div className="flex-1">
                <div className="bg-[#1A1826] rounded-lg p-8 animate-pulse">
                  <div className="h-10 bg-gray-600 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-600 rounded w-1/2 mb-6"></div>
                  <div className="h-96 bg-gray-600 rounded mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-600 rounded w-full"></div>
                    <div className="h-4 bg-gray-600 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-600 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
              <div className="w-80">
                <div className="bg-[#1A1826] rounded-lg p-6 animate-pulse">
                  <div className="h-8 bg-gray-600 rounded w-1/2 mb-6"></div>
                  <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-600 rounded w-full"></div>
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

  if (error || !post) {
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
          <div className="max-w-7xl mx-auto">
            <div className="bg-[#1A1826] rounded-lg p-8 text-center">
              <div className="text-red-400 text-xl mb-4">
                {error || 'Пост не найден'}
              </div>
              <button
                onClick={handleBackClick}
                className="px-6 py-2 bg-[#8A63D2] text-white rounded-lg hover:bg-[#7A53C2] transition-colors"
              >
                Вернуться назад
              </button>
            </div>
          </div>
        </div>
        </div>
      </>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="max-w-7xl mx-auto">
            {/* Кнопка назад */}
            <button
              onClick={handleBackClick}
              className="mb-4 sm:mb-6 lg:mb-8 inline-flex items-center space-x-2 px-3 sm:px-4 py-2 bg-[#1A1826] border border-gray-600 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors text-sm sm:text-base"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Назад</span>
            </button>

            {/* Двухколоночный макет */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
              {/* Основной контент */}
              <div className="flex-1 min-w-0">
                <article className="bg-[#1A1826] rounded-lg p-4 sm:p-6 lg:p-8">
                  {/* Заголовок */}
                  <div className="mb-4 sm:mb-6 lg:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-4 leading-tight">
                      {post.title}
                    </h1>
                    <p className="text-base sm:text-lg lg:text-xl text-gray-300 mb-4 sm:mb-6">
                      {post.preview_text}
                    </p>
                    
                    {/* Информация об авторе и кнопка подписки */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        {post.author_avatar && (
                          <img 
                            src={`data:image/png;base64,${post.author_avatar}`} 
                            alt={post.author_fio}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="text-white font-medium">{post.author_fio}</p>
                          {post.author_nickname && (
                            <p className="text-gray-400 text-sm">@{post.author_nickname}</p>
                          )}
                          <p className="text-gray-500 text-xs">Рейтинг: {post.author_rating}</p>
                        </div>
                      </div>
                      
                      {/* Кнопка подписки - показываем только если это не наш пост */}
                      {(() => {
                        const userData = getUserData();
                        const userId = userData?.id || currentUserId;
                        return userId && post.author && userId !== post.author;
                      })() && (
                        <button
                          onClick={handleSubscribe}
                          disabled={isSubscriptionLoading}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                            isSubscribed
                              ? 'bg-gray-600 text-white hover:bg-gray-700'
                              : 'bg-[#8A63D2] text-white hover:bg-[#7A53C2]'
                          } ${isSubscriptionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {isSubscriptionLoading ? (
                            <span className="flex items-center gap-2">
                              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Загрузка...
                            </span>
                          ) : isSubscribed ? (
                            '✓ Подписан'
                          ) : (
                            '+ Подписаться'
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Главное изображение */}
                  {post.preview_image_link && (
                    <div className="mb-4 sm:mb-6 lg:mb-8">
                      <img 
                        src={post.preview_image_link} 
                        alt={post.title}
                        className="w-full h-48 sm:h-64 lg:h-96 object-cover rounded-lg"
                      />
                      <p className="text-xs sm:text-sm text-gray-400 mt-2 text-center">
                        Иллюстрация: {post.author_fio}
                      </p>
                    </div>
                  )}

                  {/* Контент из блоков */}
                  <div className="space-y-8">
                    {(() => {
                      // Фильтруем блоки, убирая дублирование заголовка и описания
                      const filteredBlocks = contentBlocks.filter((block, index) => {
                        // Пропускаем первый блок, если он дублирует заголовок и описание поста
                        if (index === 0 && block.type === 'section') {
                          const titleMatches = block.title === post.title || block.title === '';
                          const descriptionMatches = block.description === post.preview_text || 
                                                    block.description.trim() === post.preview_text.trim();
                          // Если заголовок и описание совпадают, пропускаем этот блок
                          if (titleMatches && descriptionMatches) {
                            return false;
                          }
                          // Если только заголовок совпадает и описание пустое, тоже пропускаем
                          if (titleMatches && (!block.description || block.description.trim() === '')) {
                            return false;
                          }
                        }
                        return true;
                      });
                      
                      return filteredBlocks.length > 0 ? (
                        filteredBlocks.map((block, index) => {
                          console.log(`Rendering block ${index}:`, block); // Отладка
                          return renderContentBlock(block, index);
                        })
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-gray-400 text-lg mb-4">
                            Контент не найден
                          </div>
                          <p className="text-gray-500">
                            Этот пост не содержит контента или произошла ошибка при загрузке.
                          </p>
                          <div className="mt-4 text-xs text-gray-600">
                            Debug: contentBlocks.length = {contentBlocks.length}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                </article>

                {/* Секция комментариев */}
                <div className="mt-6 sm:mt-8 lg:mt-12">
                  <Comments postId={postId} />
                </div>
              </div>

              {/* Боковая панель с содержанием */}
              <div className="hidden lg:block lg:w-80">
                <div className="bg-[#1A1826] rounded-lg p-4 lg:p-6 sticky top-8">
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-4 lg:mb-6">
                    Содержание:
                  </h3>
                  <nav className="space-y-2 lg:space-y-3">
                    {(() => {
                      // Фильтруем блоки так же, как в основном контенте
                      const filteredBlocks = contentBlocks.filter((block, index) => {
                        if (index === 0 && block.type === 'section') {
                          const titleMatches = block.title === post.title || block.title === '';
                          const descriptionMatches = block.description === post.preview_text || 
                                                    block.description.trim() === post.preview_text.trim();
                          if (titleMatches && descriptionMatches) {
                            return false;
                          }
                          if (titleMatches && (!block.description || block.description.trim() === '')) {
                            return false;
                          }
                        }
                        return true;
                      });
                      
                      return filteredBlocks.length > 0 ? (
                        filteredBlocks.map((block, index) => (
                          <a 
                            key={index}
                            href={`#block-${index}`}
                            className="block text-white hover:text-cyan-300 transition-colors text-xs sm:text-sm"
                          >
                            {block.title || `${block.type} блок ${index + 1}`}
                          </a>
                        ))
                      ) : (
                        <div className="text-gray-400 text-xs sm:text-sm">
                          Содержание недоступно
                        </div>
                      );
                    })()}
                  </nav>
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
