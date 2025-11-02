'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createContent } from '@/lib/api';
import Header from '@/components/Header';

interface ContentBlock {
  id: string;
  type: 'section' | 'text' | 'pdf';
  title?: string;
  description?: string;
  image?: string;
  imageCaption?: string;
  files?: File[];
}

export default function CreateContentPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<ContentBlock[]>([
    {
      id: '1',
      type: 'section',
      title: '',
      description: '',
      image: '',
      imageCaption: ''
    }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('esoterics');
  const [isPublished, setIsPublished] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [dataSize, setDataSize] = useState(0);

  // Отслеживание изменений
  useEffect(() => {
    const hasContent = blocks.some(block => 
      block.title || block.description || block.image || (block.files && block.files.length > 0)
    );
    setHasUnsavedChanges(hasContent);
    
    // Вычисляем размер данных
    const size = JSON.stringify(blocks).length;
    setDataSize(size);
  }, [blocks]);

  // Предупреждение при попытке покинуть страницу
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const addBlock = () => {
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type: 'section',
      title: '',
      description: '',
      image: '',
      imageCaption: ''
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(block => block.id !== id));
    }
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(block => block.id === id);
    if (index === -1) return;

    const newBlocks = [...blocks];
    if (direction === 'up' && index > 0) {
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    } else if (direction === 'down' && index < blocks.length - 1) {
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    }
    setBlocks(newBlocks);
  };

  const updateBlock = (id: string, field: string, value: any) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, [field]: value } : block
    ));
  };

  const handleImageUpload = (id: string, file: File) => {
    // Валидация размера файла (максимум 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Размер файла не должен превышать 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Сжимаем изображение если оно слишком большое
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Максимальные размеры
        const maxWidth = 800;
        const maxHeight = 600;
        
        let { width, height } = img;
        
        // Масштабируем если нужно
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Конвертируем в base64 с качеством 0.8
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        updateBlock(id, 'image', compressedDataUrl);
      };
      
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handlePdfUpload = (id: string, file: File) => {
    // Валидация размера PDF файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер PDF файла не должен превышать 5MB');
      return;
    }

    const block = blocks.find(b => b.id === id);
    if (block) {
      const newFiles = [...(block.files || []), file];
      updateBlock(id, 'files', newFiles);
    }
  };

  const removePdfFile = (blockId: string, fileIndex: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (block && block.files) {
      const newFiles = block.files.filter((_, index) => index !== fileIndex);
      updateBlock(blockId, 'files', newFiles);
    }
  };

  const handleSave = async () => {
    // Валидация
    const hasContent = blocks.some(block => 
      block.title || block.description || block.image || (block.files && block.files.length > 0)
    );
    
    if (!hasContent) {
      alert('Добавьте хотя бы один блок с контентом');
      return;
    }

    // Проверяем общий размер данных
    const totalSize = JSON.stringify(blocks).length;
    if (totalSize > 100000) { // 100KB лимит
      alert('Контент слишком большой. Уменьшите размер изображений или количество блоков.');
      return;
    }

    setIsSaving(true);
    try {
      // Подготавливаем данные для отправки - упрощенная версия
      const contentData = {
        title: blocks.find(b => b.title)?.title || 'Новый контент',
        preview_text: blocks.find(b => b.description)?.description || '',
        content: JSON.stringify(blocks.map(block => ({
          type: block.type,
          title: block.title,
          description: block.description,
          image: block.image, // Оставляем изображения, но они уже сжаты
          image_caption: block.imageCaption,
          files: block.files?.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type
          }))
        }))),
        category: selectedCategory,
        is_published: isPublished
      };

      const response = await createContent(contentData);
      console.log('Response from server:', response); // Для отладки
      
      // Проверяем разные возможные структуры ответа
      if (response.post && response.post.id) {
        console.log('Content created successfully with ID:', response.post.id);
        setHasUnsavedChanges(false);
        alert('Контент успешно сохранен!');
        router.push('/contents');
      } else if (response.id) {
        console.log('Content created successfully with ID:', response.id);
        setHasUnsavedChanges(false);
        alert('Контент успешно сохранен!');
        router.push('/contents');
      } else if (response.message) {
        console.log('Server message:', response.message);
        setHasUnsavedChanges(false);
        alert('Контент успешно сохранен!');
        router.push('/contents');
      } else {
        console.error('Unexpected response structure:', response);
        throw new Error('Не удалось создать контент');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      
      // Более информативное сообщение об ошибке
      let errorMessage = 'Ошибка при сохранении контента';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/contents');
  };

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
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#1A1826] rounded-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-white">
                  Создание контента
                </h1>
                <div className="flex items-center space-x-4">
                  {hasUnsavedChanges && (
                    <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <span>Есть несохраненные изменения</span>
                    </div>
                  )}
                  <div className={`text-sm ${dataSize > 100000 ? 'text-red-400' : 'text-gray-400'}`}>
                    Размер данных: {(dataSize / 1024).toFixed(1)} KB
                    {dataSize > 100000 && <span className="ml-2">⚠️ Превышен лимит</span>}
                  </div>
                </div>
              </div>

              {/* Настройки контента */}
              <div className="bg-[#2A2A2A] rounded-lg p-6 mb-6">
                <h2 className="text-white font-medium mb-4">Настройки контента</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Категория
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1A1826] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#8A63D2] transition-colors appearance-none cursor-pointer"
                    >
                      <option value="esoterics">Эзотерика</option>
                      <option value="astrology">Астрология</option>
                      <option value="tarot">Таро</option>
                      <option value="numerology">Нумерология</option>
                      <option value="meditation">Медитация</option>
                      <option value="spirituality">Духовность</option>
                      <option value="other">Другое</option>
                    </select>
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isPublished}
                        onChange={(e) => setIsPublished(e.target.checked)}
                        className="w-5 h-5 text-[#8A63D2] bg-[#1A1826] border-gray-600 rounded focus:ring-[#8A63D2] focus:ring-2"
                      />
                      <span className="text-white text-sm font-medium">
                        Опубликовать сразу
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Блоки контента */}
              <div className="space-y-6">
                {blocks.map((block, index) => (
                  <div key={block.id} className="bg-[#2A2A2A] rounded-lg p-6">
                    {/* Заголовок блока с кнопками управления */}
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-white font-medium">
                        Блок {index + 1}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => moveBlock(block.id, 'up')}
                          disabled={index === 0}
                          className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveBlock(block.id, 'down')}
                          disabled={index === blocks.length - 1}
                          className="p-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeBlock(block.id)}
                          disabled={blocks.length === 1}
                          className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Тип блока */}
                    <div className="mb-4">
                      <label className="block text-white text-sm font-medium mb-2">
                        Выберите тип блока
                      </label>
                      <select
                        value={block.type}
                        onChange={(e) => updateBlock(block.id, 'type', e.target.value)}
                        className="w-full px-4 py-3 bg-[#1A1826] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#8A63D2] transition-colors appearance-none cursor-pointer"
                      >
                        <option value="section">Section</option>
                        <option value="text">Text</option>
                        <option value="pdf">PDF</option>
                      </select>
                    </div>

                    {/* Заголовок (для Section) */}
                    {block.type === 'section' && (
                      <div className="mb-4">
                        <label className="block text-white text-sm font-medium mb-2">
                          Заголовок
                        </label>
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => updateBlock(block.id, 'title', e.target.value)}
                          className="w-full px-4 py-3 bg-[#1A1826] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8A63D2] transition-colors"
                          placeholder="Введите заголовок"
                        />
                      </div>
                    )}

                    {/* Описание */}
                    <div className="mb-4">
                      <label className="block text-white text-sm font-medium mb-2">
                        Описание
                      </label>
                      <textarea
                        value={block.description || ''}
                        onChange={(e) => updateBlock(block.id, 'description', e.target.value)}
                        className="w-full px-4 py-3 bg-[#1A1826] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8A63D2] transition-colors resize-none"
                        rows={3}
                        placeholder="Введите описание"
                      />
                    </div>

                    {/* Загрузка изображения (для Section) */}
                    {block.type === 'section' && (
                      <div className="mb-4">
                        <label className="block text-white text-sm font-medium mb-2">
                          Изображение
                        </label>
                        <div
                          className="w-full h-48 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#8A63D2] transition-colors"
                          onClick={() => {
                            const input = document.getElementById(`image-upload-${block.id}`) as HTMLInputElement;
                            input?.click();
                          }}
                        >
                          {block.image ? (
                            <img 
                              src={block.image} 
                              alt="Uploaded" 
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="text-center">
                              <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="text-gray-400 text-sm">Нажмите для загрузки</p>
                              <p className="text-gray-500 text-xs mt-1">
                                Доступные расширения фото: jpeg, jpg, png, bmp
                              </p>
                            </div>
                          )}
                        </div>
                        <input
                          id={`image-upload-${block.id}`}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/bmp"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(block.id, file);
                          }}
                          className="hidden"
                        />
                      </div>
                    )}

                    {/* Подпись к изображению (для Section) */}
                    {block.type === 'section' && block.image && (
                      <div className="mb-4">
                        <label className="block text-white text-sm font-medium mb-2">
                          Картинка для текста
                        </label>
                        <input
                          type="text"
                          value={block.imageCaption || ''}
                          onChange={(e) => updateBlock(block.id, 'imageCaption', e.target.value)}
                          className="w-full px-4 py-3 bg-[#1A1826] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#8A63D2] transition-colors"
                          placeholder="Введите подпись к изображению"
                        />
                      </div>
                    )}

                    {/* Загрузка PDF (для PDF) */}
                    {block.type === 'pdf' && (
                      <div className="mb-4">
                        <label className="block text-white text-sm font-medium mb-2">
                          PDF файлы
                        </label>
                        <div
                          className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#8A63D2] transition-colors"
                          onClick={() => {
                            const input = document.getElementById(`pdf-upload-${block.id}`) as HTMLInputElement;
                            input?.click();
                          }}
                        >
                          <div className="text-center">
                            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-gray-400 text-sm">Нажмите для загрузки</p>
                            <p className="text-gray-500 text-xs mt-1">
                              Доступные расширения: pdf
                            </p>
                          </div>
                        </div>
                        <input
                          id={`pdf-upload-${block.id}`}
                          type="file"
                          accept=".pdf"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePdfUpload(block.id, file);
                          }}
                          className="hidden"
                        />
                        
                        {/* Список загруженных PDF файлов */}
                        {block.files && block.files.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {block.files.map((file, fileIndex) => (
                              <div key={fileIndex} className="flex items-center justify-between bg-[#1A1826] p-3 rounded-lg">
                                <span className="text-white text-sm">{file.name}</span>
                                <button
                                  onClick={() => removePdfFile(block.id, fileIndex)}
                                  className="p-1 text-red-400 hover:text-red-300"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Кнопки управления */}
              <div className="flex justify-between items-center mt-8">
                <button
                  onClick={addBlock}
                  className="flex items-center space-x-2 px-6 py-3 bg-[#8A63D2] text-white rounded-lg hover:bg-[#7A53C2] transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>+ Добавить блок</span>
                </button>

                <div className="flex space-x-4">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 bg-[#6B46C1] text-white rounded-lg hover:bg-[#5B3A9F] transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || dataSize > 100000}
                    className="px-6 py-3 bg-[#8A63D2] text-white rounded-lg hover:bg-[#7A53C2] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
