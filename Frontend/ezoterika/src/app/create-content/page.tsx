'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createContent } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RichTextEditor from '@/components/RichTextEditor';

interface ContentBlock {
  id: string;
  type: 'section' | 'text' | 'image' | 'audio';
  title?: string;
  description?: string;
  image?: string;
  imageCaption?: string;
  imageDescription?: string;
  files?: File[];
  audioFiles?: File[];
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
      imageCaption: '',
      imageDescription: ''
    },
    {
      id: '2',
      type: 'audio',
      audioFiles: []
    },
    {
      id: '3',
      type: 'section',
      title: '',
      description: ''
    }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('esoterics');
  const [isPublished, setIsPublished] = useState(false);
  const [accessibility, setAccessibility] = useState<'subscribers' | 'all' | 'my_subscribers'>('all');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [dataSize, setDataSize] = useState(0);

  // Отслеживание изменений
  useEffect(() => {
    const hasContent = blocks.some(block => {
      if (block.type === 'section') {
        return block.title || block.description || block.image;
      } else if (block.type === 'text') {
        return block.title;
      } else if (block.type === 'image') {
        return block.image;
      } else if (block.type === 'audio') {
        return block.audioFiles && block.audioFiles.length > 0;
      }
      return false;
    });
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
      imageCaption: '',
      imageDescription: ''
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

  const handleAudioUpload = (id: string, file: File) => {
    // Валидация размера аудио файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Размер аудио файла не должен превышать 10MB');
      return;
    }

    const block = blocks.find(b => b.id === id);
    if (block) {
      const newFiles = [...(block.audioFiles || []), file];
      updateBlock(id, 'audioFiles', newFiles);
    }
  };

  const removeAudioFile = (blockId: string, fileIndex: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (block && block.audioFiles) {
      const newFiles = block.audioFiles.filter((_, index) => index !== fileIndex);
      updateBlock(blockId, 'audioFiles', newFiles);
    }
  };

  const handleSave = async () => {
    // Валидация - проверяем наличие контента
    const hasContent = blocks.some(block => {
      if (block.type === 'section') {
        return block.title || block.description || block.image;
      } else if (block.type === 'text') {
        return block.title;
      } else if (block.type === 'image') {
        return block.image;
      } else if (block.type === 'audio') {
        return block.audioFiles && block.audioFiles.length > 0;
      }
      return false;
    });
    
    if (!hasContent) {
      alert('Добавьте хотя бы один блок с контентом');
      return;
    }

    // Находим первый блок с заголовком для title
    const titleBlock = blocks.find(b => b.title && b.title.trim());
    if (!titleBlock || !titleBlock.title?.trim()) {
      alert('Добавьте заголовок в одном из блоков');
      return;
    }

    // Проверяем общий размер данных
    const totalSize = JSON.stringify(blocks).length;
    if (totalSize > 500000) { // 500KB лимит
      alert('Контент слишком большой. Уменьшите размер изображений или количество блоков.');
      return;
    }

    setIsSaving(true);
    try {
      // Формируем markdown контент из блоков
      const markdownContent = blocks.map(block => {
        let content = '';
        
        if (block.type === 'section') {
          if (block.title) content += `## ${block.title}\n\n`;
          if (block.description) content += `${block.description}\n\n`;
          if (block.image) content += `![${block.imageCaption || ''}](${block.image})\n\n`;
        } else if (block.type === 'text') {
          if (block.title) content += `${block.title}\n\n`;
        } else if (block.type === 'image') {
          if (block.image) content += `![${block.imageCaption || ''}](${block.image})\n\n`;
        } else if (block.type === 'audio') {
          if (block.audioFiles && block.audioFiles.length > 0) {
            block.audioFiles.forEach(file => {
              content += `[🎵 ${file.name}](audio/${file.name})\n\n`;
            });
          }
        }
        
        return content;
      }).join('---\n\n');

      // Находим preview_text из первого section блока
      const previewBlock = blocks.find(b => b.type === 'section' && b.description);
      const previewText = previewBlock?.description || titleBlock.title;

      // Находим preview_image из первого блока с изображением
      const imageBlock = blocks.find(b => (b.type === 'section' || b.type === 'image') && b.image);
      const previewImageLink = imageBlock?.image || null;

      // Подготавливаем данные для отправки
      const contentData = {
        title: titleBlock.title.trim(),
        preview_text: previewText.trim(),
        content: markdownContent.trim(),
        preview_image_link: previewImageLink,
        category: selectedCategory,
        is_published: isPublished,
        accessibility: accessibility
      };

      const response = await createContent(contentData);
      console.log('Response from server:', response);
      
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
      } else if (error && typeof error === 'object' && 'details' in error) {
        errorMessage = String(error.details);
      }
      
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/contents');
  };

  const renderBlock = (block: ContentBlock, index: number) => {
    const blockIndex = blocks.findIndex(b => b.id === block.id);
    const canMoveUp = blockIndex > 0;
    const canMoveDown = blockIndex < blocks.length - 1;

    return (
      <div key={block.id}>
        {index > 0 && (
          <div className="my-12">
            <div className="border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}></div>
          </div>
        )}
        
        <div 
          className="bg-[#00051B] rounded-[32px] border text-white"
          style={{ 
            width: '893px',
            borderWidth: '1px',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {/* Control Buttons */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button 
                className="rounded-full flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)' 
                }}
                onClick={() => moveBlock(block.id, 'up')}
                disabled={!canMoveUp}
              >
                <svg width="24" height="24" viewBox="0 0 12 12" fill="none">
                  <path d="M3 6L6 3L9 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className="rounded-full flex items-center justify-center hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)' 
                }}
                onClick={() => moveBlock(block.id, 'down')}
                disabled={!canMoveDown}
              >
                <svg width="24" height="24" viewBox="0 0 12 12" fill="none">
                  <path d="M3 6L6 9L9 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <button 
              className="rounded-lg flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
              style={{ 
                width: '118px',
                height: '48px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)' 
              }}
              onClick={() => removeBlock(block.id)}
            >
              <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
                <path d="M5.33333 4H10.6667M6.66667 4V3.33333C6.66667 2.89131 7.02448 2.53333 7.46667 2.53333H8.53333C8.97552 2.53333 9.33333 2.89131 9.33333 3.33333V4M3.33333 4H12.6667L12 13.3333H4L3.33333 4Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm font-medium text-white">Удалить</span>
            </button>
          </div>

          {/* Block Type Selection */}
          <div className="mb-4">
            <div className="mb-2">
              <span className="text-sm text-white/70">Выберите тип блока</span>
            </div>
            <div className="relative">
              <select
                className="w-full px-4 py-3 rounded-lg border text-white bg-[#090F1B] focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none cursor-pointer"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\'%3E%3Cpath d=\'M1 1L6 6L11 1\' stroke=\'%23ffffff\' stroke-opacity=\'0.7\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '40px'
                }}
                value={block.type}
                onChange={(e) => {
                  const newType = e.target.value as ContentBlock['type'];
                  updateBlock(block.id, 'type', newType);
                }}
              >
                <option value="section" className="bg-[#090F1B]">Section</option>
                <option value="text" className="bg-[#090F1B]">Text</option>
                <option value="image" className="bg-[#090F1B]">Image</option>
                <option value="audio" className="bg-[#090F1B]">Audio</option>
              </select>
            </div>
          </div>

          {/* Render content based on block type */}
          {block.type === 'section' && (
            <>
              <div className="mt-4">
                <RichTextEditor
                  value={block.title || ''}
                  onChange={(value) => updateBlock(block.id, 'title', value)}
                  label="Заголовок"
                  rows={8}
                  defaultHeading="H1"
                />
              </div>
              <div className="mt-8">
                <RichTextEditor
                  value={block.description || ''}
                  onChange={(value) => updateBlock(block.id, 'description', value)}
                  label="Описание"
                  rows={8}
                  defaultHeading="P1"
                />
              </div>
              <div className="mt-8">
                <div
                  className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-white/30 transition-colors"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    backgroundColor: '#090F1B'
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/jpeg,image/jpg,image/png,image/bmp';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleImageUpload(block.id, file);
                    };
                    input.click();
                  }}
                >
                  <div className="flex flex-col items-center gap-4">
                    {block.image ? (
                      <img src={block.image} alt="Uploaded" className="max-w-full max-h-64 rounded" />
                    ) : (
                      <>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-white/60">
                          <path d="M12 5V15M12 5L8 9M12 5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <rect x="3" y="12" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        <div className="flex flex-col gap-2">
                          <span className="text-sm font-medium text-white">Нажмите для загрузки</span>
                          <span className="text-xs text-white/60">Доступные расширения фото: jpeg, jpg, png, bmp</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {block.type === 'text' && (
            <div className="mt-4">
              <RichTextEditor
                value={block.title || ''}
                onChange={(value) => updateBlock(block.id, 'title', value)}
                label="Заголовок"
                rows={8}
                defaultHeading="H1"
              />
            </div>
          )}

          {block.type === 'image' && (
            <div className="mt-4">
              <div
                className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-white/30 transition-colors"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: '#090F1B'
                }}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/jpeg,image/jpg,image/png,image/bmp';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) handleImageUpload(block.id, file);
                  };
                  input.click();
                }}
              >
                <div className="flex flex-col items-center gap-4">
                  {block.image ? (
                    <img src={block.image} alt="Uploaded" className="max-w-full max-h-64 rounded" />
                  ) : (
                    <>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-white/60">
                        <path d="M12 5V15M12 5L8 9M12 5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <rect x="3" y="12" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium text-white">Нажмите для загрузки</span>
                        <span className="text-xs text-white/60">Доступные расширения фото: jpeg, jpg, png, bmp</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {block.type === 'audio' && (
            <>
              <div className="mb-4">
                <div
                  className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-white/30 transition-colors"
                  style={{
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    backgroundColor: '#090F1B'
                  }}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'audio/*';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleAudioUpload(block.id, file);
                    };
                    input.click();
                  }}
                >
                  <div className="flex flex-col items-center gap-4">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-white/60">
                      <path d="M12 5V15M12 5L8 9M12 5L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <rect x="3" y="12" width="18" height="10" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                    <div className="flex flex-col gap-2">
                      <span className="text-sm font-medium text-white">Нажмите для загрузки</span>
                      <span className="text-xs text-white/60">Доступные расширения: mp3, wav, ogg</span>
                    </div>
                  </div>
                </div>
              </div>
              {block.audioFiles && block.audioFiles.length > 0 && (
                <div className="space-y-2">
                  {block.audioFiles.map((file, fileIndex) => (
                    <div
                      key={fileIndex}
                      className="flex items-center justify-between px-4 py-3 rounded-lg border"
                      style={{
                        backgroundColor: '#090F1B',
                        borderColor: 'rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white/70">
                          <path d="M9 18V5L21 3V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" fill="none"/>
                        </svg>
                        <span className="text-sm text-white">{file.name}</span>
                      </div>
                      <button
                        className="text-white/60 hover:text-white transition-colors"
                        onClick={() => removeAudioFile(block.id, fileIndex)}
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Header activePage="contents" />
      <div 
        className="min-h-screen flex flex-col items-center p-8"
        style={{ 
          backgroundColor: '#090F1B'
        }}
      >
        {blocks.map((block, index) => renderBlock(block, index))}
        
        {/* Add Block Button */}
        <div className="mt-8">
          <button
            onClick={addBlock}
            className="px-6 py-3 rounded-lg border text-white hover:bg-white/10 transition-colors"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            + Добавить блок
          </button>
        </div>

        {/* Category and Publication Settings */}
        <div className="mt-8 flex flex-col gap-4" style={{ width: '893px' }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/70 mb-2">Категория</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border text-white bg-[#090F1B] focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none cursor-pointer"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\'%3E%3Cpath d=\'M1 1L6 6L11 1\' stroke=\'%23ffffff\' stroke-opacity=\'0.7\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '40px'
                }}
              >
                <option value="esoterics" className="bg-[#090F1B]">Эзотерика</option>
                <option value="astrology" className="bg-[#090F1B]">Астрология</option>
                <option value="tarot" className="bg-[#090F1B]">Таро</option>
                <option value="numerology" className="bg-[#090F1B]">Нумерология</option>
                <option value="meditation" className="bg-[#090F1B]">Медитация</option>
                <option value="spirituality" className="bg-[#090F1B]">Духовность</option>
                <option value="other" className="bg-[#090F1B]">Другое</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Кому доступен для просмотра</label>
              <select
                value={accessibility}
                onChange={(e) => setAccessibility(e.target.value as 'subscribers' | 'all' | 'my_subscribers')}
                className="w-full px-4 py-3 rounded-lg border text-white bg-[#090F1B] focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none cursor-pointer"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'12\' height=\'8\' viewBox=\'0 0 12 8\' fill=\'none\'%3E%3Cpath d=\'M1 1L6 6L11 1\' stroke=\'%23ffffff\' stroke-opacity=\'0.7\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: '40px'
                }}
              >
                <option value="all" className="bg-[#090F1B]">Всем</option>
                <option value="subscribers" className="bg-[#090F1B]">Подписчикам</option>
                <option value="my_subscribers" className="bg-[#090F1B]">Всем моим подписчикам</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-5 h-5 rounded border cursor-pointer"
              style={{
                backgroundColor: isPublished ? '#00051B' : '#090F1B',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                accentColor: '#00051B'
              }}
            />
            <label htmlFor="isPublished" className="text-sm text-white/70 cursor-pointer">
              Опубликовать
            </label>
          </div>
        </div>

        {/* Save and Cancel Buttons */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={handleCancel}
            className="px-8 py-3 rounded-lg border text-white hover:bg-white/10 transition-colors"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.1)'
            }}
            disabled={isSaving}
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 rounded-lg border text-white hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isSaving ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.15)',
              borderColor: 'rgba(255, 255, 255, 0.2)'
            }}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
