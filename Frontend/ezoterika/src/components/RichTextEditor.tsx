'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Динамический импорт ReactQuill для избежания SSR проблем
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  defaultHeading?: 'H1' | 'H2' | 'H3' | 'P' | 'P1';
  label?: string;
}

// Функция для извлечения текста из HTML элемента (без рекурсии)
const extractTextFromHtml = (html: string): string => {
  if (!html) return '';
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
};

// Функция для конвертации HTML в Markdown
const htmlToMarkdown = (html: string): string => {
  if (!html) return '';
  
  let markdown = html;
  let depth = 0;
  const maxDepth = 10; // Защита от бесконечной рекурсии
  
  const processHtml = (content: string, currentDepth: number): string => {
    if (currentDepth > maxDepth) {
      return extractTextFromHtml(content);
    }
    
    let result = content;
    
    // Обрабатываем списки
    result = result.replace(/<ul[^>]*>(.*?)<\/ul>/gis, (match, listContent) => {
      const items = listContent.match(/<li[^>]*>(.*?)<\/li>/gis) || [];
      return items.map((item: string) => {
        const itemContent = item.replace(/<li[^>]*>(.*?)<\/li>/gis, '$1');
        const processed = processHtml(itemContent, currentDepth + 1);
        return `- ${processed.trim()}`;
      }).join('\n') + '\n\n';
    });
    
    // Заголовки
    result = result.replace(/<h1[^>]*>(.*?)<\/h1>/gi, (match, content) => {
      return '# ' + processHtml(content, currentDepth + 1).trim() + '\n\n';
    });
    result = result.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (match, content) => {
      return '## ' + processHtml(content, currentDepth + 1).trim() + '\n\n';
    });
    result = result.replace(/<h3[^>]*>(.*?)<\/h3>/gi, (match, content) => {
      return '### ' + processHtml(content, currentDepth + 1).trim() + '\n\n';
    });
    
    // Ссылки
    result = result.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, (match, url, text) => {
      const linkText = processHtml(text, currentDepth + 1);
      return `[${linkText}](${url})`;
    });
    
    // Жирный текст
    result = result.replace(/<strong[^>]*>(.*?)<\/strong>/gi, (match, content) => {
      return '**' + processHtml(content, currentDepth + 1) + '**';
    });
    result = result.replace(/<b[^>]*>(.*?)<\/b>/gi, (match, content) => {
      return '**' + processHtml(content, currentDepth + 1) + '**';
    });
    
    // Курсив
    result = result.replace(/<em[^>]*>(.*?)<\/em>/gi, (match, content) => {
      return '*' + processHtml(content, currentDepth + 1) + '*';
    });
    result = result.replace(/<i[^>]*>(.*?)<\/i>/gi, (match, content) => {
      return '*' + processHtml(content, currentDepth + 1) + '*';
    });
    
    // Подчеркивание
    result = result.replace(/<u[^>]*>(.*?)<\/u>/gi, (match, content) => {
      return '<u>' + processHtml(content, currentDepth + 1) + '</u>';
    });
    
    // Параграфы
    result = result.replace(/<p[^>]*>(.*?)<\/p>/gi, (match, content) => {
      const text = processHtml(content, currentDepth + 1);
      return text ? text + '\n\n' : '\n\n';
    });
    
    // Div элементы
    result = result.replace(/<div[^>]*>(.*?)<\/div>/gi, (match, content) => {
      const text = processHtml(content, currentDepth + 1);
      return text ? text + '\n\n' : '\n\n';
    });
    
    // Переносы строк
    result = result.replace(/<br\s*\/?>/gi, '\n');
    
    // Удаляем пустые параграфы
    result = result.replace(/<p><br\s*\/?><\/p>/gi, '\n\n');
    result = result.replace(/<p>\s*<\/p>/gi, '\n\n');
    result = result.replace(/<div><br\s*\/?><\/div>/gi, '\n\n');
    result = result.replace(/<div>\s*<\/div>/gi, '\n\n');
    
    // Удаляем оставшиеся HTML теги
    result = result.replace(/<[^>]+>/g, '');
    
    return result;
  };
  
  markdown = processHtml(markdown, depth);
  
  // Декодируем HTML entities
  const textarea = document.createElement('textarea');
  textarea.innerHTML = markdown;
  markdown = textarea.value;
  
  // Очищаем лишние переносы строк
  markdown = markdown.replace(/\n{3,}/g, '\n\n');
  markdown = markdown.trim();
  
  return markdown;
};

// Функция для конвертации Markdown в HTML (для начального значения)
const markdownToHtml = (markdown: string): string => {
  if (!markdown) return '';
  
  let html = markdown;
  
  // Экранируем HTML
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Восстанавливаем наши теги подчеркивания
  html = html.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/g, '<u>$1</u>');
  
  // Заголовки
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Ссылки
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    
  // Жирный текст
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
  // Курсив
  html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>');
    
  // Списки
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      if (trimmedLine.match(/^<h[1-3]|^<img/)) {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(line);
        continue;
      }
      
      if (trimmedLine.startsWith('- ')) {
        if (!inList) {
        processedLines.push('<ul>');
          inList = true;
        }
        const listItem = trimmedLine.substring(2);
      processedLines.push(`<li>${listItem}</li>`);
        continue;
      }
      
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      
      if (trimmedLine === '') {
        continue;
      }
      
      if (trimmedLine && !trimmedLine.match(/^<[h|u|l|i]/)) {
      processedLines.push(`<p>${line}</p>`);
      } else {
        processedLines.push(line);
      }
    }
    
    if (inList) {
      processedLines.push('</ul>');
    }
    
    html = processedLines.join('\n');
    html = html.replace(/(<p[^>]*>)(.*?)(<\/p>)/gs, (match, open, content, close) => {
      return open + content.replace(/\n/g, '<br />') + close;
    });
    
  return html || '';
};

// Популярные эмодзи, сгруппированные по категориям
const emojiCategories = {
  'Смайлики': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔'],
  'Эмоции': ['😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤐', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫'],
  'Жесты': ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  'Сердечки': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐'],
  'Символы': ['⭐', '🌟', '✨', '💫', '💥', '💢', '💯', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈'],
  'Животные': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇'],
  'Еда': ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🌽', '🥕', '🥔', '🍠', '🥐', '🥯', '🍞'],
  'Активности': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🏹', '🎣', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂'],
};

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = '', 
  rows = 8, 
  defaultHeading = 'H1',
  label = 'Заголовок'
}: RichTextEditorProps) {
  const [quillValue, setQuillValue] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [emojiPosition, setEmojiPosition] = useState({ top: 0, left: 0 });
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const quillRef = useRef<any>(null);

  // Инициализация при монтировании
  useEffect(() => {
    setIsMounted(true);
    // Конвертируем markdown в HTML для Quill
    const html = markdownToHtml(value);
    setQuillValue(html);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Обновление при изменении value извне
  useEffect(() => {
    if (isMounted) {
      const html = markdownToHtml(value);
      // Проверяем, чтобы не обновлять, если значение уже такое же
      const currentMarkdown = htmlToMarkdown(quillValue);
      if (currentMarkdown !== value) {
        setQuillValue(html);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isMounted]);

  // Обработчик изменения в Quill
  const handleChange = (content: string) => {
    setQuillValue(content);
    // Конвертируем HTML обратно в Markdown
    const markdown = htmlToMarkdown(content);
    onChange(markdown);
  };

  // Обработчик вставки эмодзи
  const handleEmojiClick = (emoji: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      if (range) {
        quill.insertText(range.index, emoji, 'user');
        quill.setSelection(range.index + emoji.length);
      } else {
        quill.insertText(quill.getLength(), emoji, 'user');
      }
      setIsEmojiPickerOpen(false);
    }
  };

  // Обработчик позиционирования эмодзи-пикера
  useEffect(() => {
    if (isEmojiPickerOpen && emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect();
      setEmojiPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
  }, [isEmojiPickerOpen]);

  // Настройка модулей Quill
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link'],
        ['clean']
      ],
    },
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'link'
  ];

  if (!isMounted) {
    return (
      <div className="w-full relative">
        <div className="mb-2">
          <span className="text-xs sm:text-sm text-white/70">{label}</span>
          </div>
            <div 
          className="rounded-lg border"
              style={{ 
            backgroundColor: '#090F1B',
                borderColor: 'rgba(255, 255, 255, 0.1)',
            minHeight: `${rows * 20}px`,
          }}
        >
          <div className="p-4 text-white/50">Загрузка редактора...</div>
      </div>
            </div>
  );
  }

  return (
    <div className="w-full relative">
      {/* Label */}
      <div className="mb-2">
        <span className="text-xs sm:text-sm text-white/70">{label}</span>
      </div>

      {/* Quill Editor */}
      <div className="quill-editor-wrapper relative">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={quillValue}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          style={{
            backgroundColor: '#090F1B',
          }}
        />
        {/* Кастомная кнопка эмодзи - позиционируем внутри тулбара */}
        <div 
          className="absolute"
          style={{ 
            top: '0.5rem',
            right: '0.5rem',
            zIndex: 1000
          }}
        >
        <button
          ref={emojiButtonRef}
          type="button"
          onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
          className="p-1.5 sm:p-1 text-white/70 hover:text-white active:text-white hover:bg-white/5 active:bg-white/10 rounded transition-colors touch-manipulation min-w-[36px] sm:min-w-[32px] min-h-[36px] sm:min-h-[32px] flex items-center justify-center"
          title="Эмодзи"
        >
          <span className="text-base sm:text-lg">😀</span>
        </button>
        </div>
        
        {/* Выпадающее меню эмодзи */}
        {isEmojiPickerOpen && (
          <>
            <div 
              className="fixed inset-0" 
              onClick={() => setIsEmojiPickerOpen(false)}
              style={{ 
                backgroundColor: 'transparent',
                zIndex: 9998
              }}
            />
            <div 
              className="fixed rounded-lg border overflow-hidden shadow-lg"
              style={{
                backgroundColor: '#1A1A1A',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                width: '320px',
                maxWidth: '90vw',
                maxHeight: '400px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                top: `${emojiPosition.top}px`,
                left: `${Math.max(8, emojiPosition.left - 160)}px`,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div className="overflow-y-auto p-3" style={{ maxHeight: '360px' }}>
                {Object.entries(emojiCategories).map(([category, emojis]) => (
                  <div key={category} className="mb-4">
                    <div className="text-xs text-white/50 mb-2 px-2 font-medium">{category}</div>
                    <div className="grid grid-cols-8 gap-1">
                      {emojis.map((emoji, index) => (
                        <button
                          key={`${category}-${index}`}
                          type="button"
                          onClick={() => handleEmojiClick(emoji)}
                          className="text-lg sm:text-xl p-1.5 hover:bg-white/10 active:bg-white/20 rounded transition-colors touch-manipulation flex items-center justify-center min-h-[36px]"
                          title={emoji}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
