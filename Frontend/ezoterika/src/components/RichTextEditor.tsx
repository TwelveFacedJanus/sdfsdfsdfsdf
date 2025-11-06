'use client';

import { useRef, useState, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  defaultHeading?: 'H1' | 'H2' | 'H3' | 'P' | 'P1';
  label?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = '', 
  rows = 8, 
  defaultHeading = 'H1',
  label = 'Заголовок'
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const headingButtonRef = useRef<HTMLButtonElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const [currentHeading, setCurrentHeading] = useState(defaultHeading);
  const [isHeadingMenuOpen, setIsHeadingMenuOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [emojiPosition, setEmojiPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isHeadingMenuOpen && headingButtonRef.current) {
      const rect = headingButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
  }, [isHeadingMenuOpen]);

  useEffect(() => {
    if (isEmojiPickerOpen && emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect();
      setEmojiPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX
      });
    }
  }, [isEmojiPickerOpen]);

  const insertMarkdown = (before: string, after: string = '', replaceSelection?: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);

    let newValue = '';
    let newCursorPos = start + before.length;

    if (replaceSelection && selectedText) {
      // Заменяем выделенный текст
      newValue = textBefore + before + selectedText + after + textAfter;
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else if (selectedText) {
      // Оборачиваем выделенный текст
      newValue = textBefore + before + selectedText + after + textAfter;
      newCursorPos = start + before.length + selectedText.length + after.length;
    } else {
      // Вставляем маркеры без текста
      newValue = textBefore + before + after + textAfter;
      newCursorPos = start + before.length;
    }

    onChange(newValue);
    
    // Восстанавливаем позицию курсора после обновления
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleBold = () => {
    insertMarkdown('**', '**', true);
  };

  const handleItalic = () => {
    insertMarkdown('*', '*', true);
  };

  const handleUnderline = () => {
    insertMarkdown('<u>', '</u>', true);
  };

  const handleLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      insertMarkdown('[', '](url)', false);
    } else {
      insertMarkdown('[текст](url)', '', false);
    }
  };

  const handleList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);

    let newValue = '';
    let newCursorPos = start;

    if (selectedText) {
      // Преобразуем выделенные строки в список
      const lines = selectedText.split('\n').filter(line => line.trim());
      const listItems = lines.map(line => `- ${line.trim()}`).join('\n');
      newValue = textBefore + listItems + textAfter;
      newCursorPos = start + listItems.length;
    } else {
      // Вставляем пустой элемент списка
      newValue = textBefore + '- ' + textAfter;
      newCursorPos = start + 2;
    }

    onChange(newValue);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleHeadingChange = (heading: 'H1' | 'H2' | 'H3' | 'P' | 'P1') => {
    setCurrentHeading(heading);
    setIsHeadingMenuOpen(false);
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);

    // Определяем маркер для каждого типа заголовка
    let markdownPrefix = '';
    let markdownSuffix = '';
    
    if (heading === 'H1') {
      markdownPrefix = '# ';
    } else if (heading === 'H2') {
      markdownPrefix = '## ';
    } else if (heading === 'H3') {
      markdownPrefix = '### ';
    } else if (heading === 'P' || heading === 'P1') {
      // Для обычного текста ничего не добавляем
      return;
    }

    let newValue = '';
    let newCursorPos = start;

    if (selectedText) {
      // Если есть выделенный текст, применяем форматирование к нему
      newValue = textBefore + markdownPrefix + selectedText + markdownSuffix + textAfter;
      newCursorPos = start + markdownPrefix.length + selectedText.length + markdownSuffix.length;
    } else {
      // Если текста нет, вставляем маркер в текущую позицию
      newValue = textBefore + markdownPrefix + markdownSuffix + textAfter;
      newCursorPos = start + markdownPrefix.length;
    }

    onChange(newValue);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  const handleEmojiClick = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = value.substring(0, start);
    const textAfter = value.substring(end);

    const newValue = textBefore + emoji + textAfter;
    const newCursorPos = start + emoji.length;

    onChange(newValue);
    setIsEmojiPickerOpen(false);
    
    setTimeout(() => {
      if (textarea) {
        textarea.focus();
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
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

  // Функция для рендеринга markdown в HTML
  const renderMarkdown = (text: string): string => {
    if (!text) return '<p class="text-white/50 italic">Начните вводить текст...</p>';
    
    let html = text;
    
    // Экранируем HTML теги (кроме тех, что мы сами добавляем)
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Восстанавливаем наши теги подчеркивания
    html = html.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/g, '<u class="underline">$1</u>');
    
    // Заголовки (обрабатываем до других элементов)
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-white mt-4 mb-2">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-white mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold text-white mt-4 mb-2">$1</h1>');
    
    // Изображения
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-lg my-4" />');
    
    // Ссылки
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Жирный текст (должен быть после ссылок)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
    
    // Курсив (после жирного, чтобы не конфликтовать) - используем простой паттерн
    // Ищем одиночные звездочки, которые не являются частью двойных
    html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em class="italic">$1</em>');
    
    // Разбиваем на строки для обработки списков и параграфов
    const lines = html.split('\n');
    const processedLines: string[] = [];
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Проверяем, является ли строка заголовком или изображением
      if (trimmedLine.match(/^<h[1-3]|^<img/)) {
        if (inList) {
          processedLines.push('</ul>');
          inList = false;
        }
        processedLines.push(line);
        continue;
      }
      
      // Проверяем, является ли строка элементом списка
      if (trimmedLine.startsWith('- ')) {
        if (!inList) {
          processedLines.push('<ul class="list-disc ml-6 mb-4 space-y-1">');
          inList = true;
        }
        const listItem = trimmedLine.substring(2);
        processedLines.push(`<li class="text-white/90">${listItem}</li>`);
        continue;
      }
      
      // Если это не список, закрываем список если он был открыт
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      
      // Пустая строка - параграф
      if (trimmedLine === '') {
        if (i > 0 && processedLines[processedLines.length - 1] && !processedLines[processedLines.length - 1].match(/^<\/|^<h|^<img/)) {
          // Пропускаем пустые строки между элементами
        }
        continue;
      }
      
      // Обычный текст - оборачиваем в параграф
      if (trimmedLine && !trimmedLine.match(/^<[h|u|l|i]/)) {
        processedLines.push(`<p class="mb-3 text-white/90 leading-relaxed">${line}</p>`);
      } else {
        processedLines.push(line);
      }
    }
    
    // Закрываем список если он остался открытым
    if (inList) {
      processedLines.push('</ul>');
    }
    
    html = processedLines.join('\n');
    
    // Переносы строк внутри параграфов
    html = html.replace(/(<p[^>]*>)(.*?)(<\/p>)/gs, (match, open, content, close) => {
      return open + content.replace(/\n/g, '<br />') + close;
    });
    
    return html || '<p class="text-white/50 italic">Начните вводить текст...</p>';
  };

  const Toolbar = () => (
    <div 
      className="flex items-center gap-1 sm:gap-2 p-2 sm:p-3 border-b overflow-x-auto scrollbar-hide relative"
      style={{
        backgroundColor: '#1A1A1A',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        overflowY: 'visible'
      }}
    >
      {/* Heading selector - dropdown style */}
      <div className="relative flex-shrink-0" style={{ zIndex: isHeadingMenuOpen ? 10000 : 'auto' }}>
        <button
          ref={headingButtonRef}
          type="button"
          onClick={() => setIsHeadingMenuOpen(!isHeadingMenuOpen)}
          className="flex items-center gap-1 text-white/70 text-xs sm:text-sm font-medium px-2 sm:px-2.5 py-1.5 sm:py-1 cursor-pointer hover:text-white active:text-white hover:bg-white/5 active:bg-white/10 rounded transition-colors touch-manipulation min-h-[36px] sm:min-h-[32px]"
        >
          <span>{currentHeading}</span>
          <div className="flex flex-col -space-y-1">
            <svg className="w-2 sm:w-2.5 h-2 sm:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 12 12">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6L6 3L9 6" />
            </svg>
            <svg className="w-2 sm:w-2.5 h-2 sm:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 12 12">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6L6 9L9 6" />
            </svg>
          </div>
        </button>
        
        {isHeadingMenuOpen && (
          <>
            <div 
              className="fixed inset-0" 
              onClick={() => setIsHeadingMenuOpen(false)}
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
                minWidth: '80px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                top: `${menuPosition.top}px`,
                left: `${menuPosition.left}px`,
                zIndex: 9999
              }}
            >
              {(['H1', 'H2', 'H3', 'P', 'P1'] as const).map((heading) => (
                <button
                  key={heading}
                  type="button"
                  onClick={() => handleHeadingChange(heading)}
                  className={`w-full text-left px-3 py-2 text-xs sm:text-sm hover:bg-white/10 active:bg-white/20 transition-colors touch-manipulation ${
                    currentHeading === heading ? 'text-white bg-white/5' : 'text-white/70'
                  }`}
                >
                  {heading}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="h-4 sm:h-5 w-px mx-0.5 sm:mx-1 flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Bold */}
      <button
        type="button"
        onClick={handleBold}
        className="px-2 sm:px-2.5 py-1.5 sm:py-1 text-white/70 text-xs sm:text-sm font-bold hover:text-white active:text-white hover:bg-white/5 active:bg-white/10 rounded transition-colors touch-manipulation min-w-[32px] sm:min-w-[28px] min-h-[36px] sm:min-h-[32px] flex items-center justify-center"
        title="Жирный"
      >
        B
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={handleItalic}
        className="px-2 sm:px-2.5 py-1.5 sm:py-1 text-white/70 text-xs sm:text-sm italic hover:text-white active:text-white hover:bg-white/5 active:bg-white/10 rounded transition-colors touch-manipulation min-w-[32px] sm:min-w-[28px] min-h-[36px] sm:min-h-[32px] flex items-center justify-center"
        title="Курсив"
      >
        I
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={handleUnderline}
        className="px-2 sm:px-2.5 py-1.5 sm:py-1 text-white/70 text-xs sm:text-sm underline hover:text-white active:text-white hover:bg-white/5 active:bg-white/10 rounded transition-colors touch-manipulation min-w-[32px] sm:min-w-[28px] min-h-[36px] sm:min-h-[32px] flex items-center justify-center"
        title="Подчеркнутый"
      >
        U
      </button>

      <div className="h-4 sm:h-5 w-px mx-0.5 sm:mx-1 flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Link */}
      <button
        type="button"
        onClick={handleLink}
        className="p-1.5 sm:p-1 text-white/70 hover:text-white active:text-white hover:bg-white/5 active:bg-white/10 rounded transition-colors touch-manipulation min-w-[36px] sm:min-w-[32px] min-h-[36px] sm:min-h-[32px] flex items-center justify-center"
        title="Ссылка"
      >
        <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>

      <div className="h-4 sm:h-5 w-px mx-0.5 sm:mx-1 flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Bullet list */}
      <button
        type="button"
        onClick={handleList}
        className="p-1.5 sm:p-1 text-white/70 hover:text-white active:text-white hover:bg-white/5 active:bg-white/10 rounded transition-colors touch-manipulation min-w-[36px] sm:min-w-[32px] min-h-[36px] sm:min-h-[32px] flex items-center justify-center"
        title="Маркированный список"
      >
        <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="4" cy="6" r="1" fill="currentColor" />
          <circle cx="4" cy="12" r="1" fill="currentColor" />
          <circle cx="4" cy="18" r="1" fill="currentColor" />
          <line x1="8" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="h-4 sm:h-5 w-px mx-0.5 sm:mx-1 flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Preview Toggle */}
      <button
        type="button"
        onClick={() => setShowPreview(!showPreview)}
        className="p-1.5 sm:p-1 text-white/70 hover:text-white active:text-white hover:bg-white/5 active:bg-white/10 rounded transition-colors touch-manipulation min-w-[36px] sm:min-w-[32px] min-h-[36px] sm:min-h-[32px] flex items-center justify-center"
        title={showPreview ? "Редактирование" : "Предпросмотр"}
      >
        <svg className="w-4 h-4 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {showPreview ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          ) : (
            <>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </>
          )}
        </svg>
      </button>

      <div className="h-4 sm:h-5 w-px mx-0.5 sm:mx-1 flex-shrink-0" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Emoji Picker */}
      <div className="relative flex-shrink-0" style={{ zIndex: isEmojiPickerOpen ? 10000 : 'auto' }}>
        <button
          ref={emojiButtonRef}
          type="button"
          onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
          className="p-1.5 sm:p-1 text-white/70 hover:text-white active:text-white hover:bg-white/5 active:bg-white/10 rounded transition-colors touch-manipulation min-w-[36px] sm:min-w-[32px] min-h-[36px] sm:min-h-[32px] flex items-center justify-center"
          title="Эмодзи"
        >
          <span className="text-base sm:text-lg">😀</span>
        </button>
        
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

  return (
    <div className="w-full relative">
      {/* Label */}
      <div className="mb-2">
        <span className="text-xs sm:text-sm text-white/70">{label}</span>
      </div>
      
      {/* Editor container */}
      <div 
        className="rounded-lg border relative"
        style={{
          backgroundColor: '#090F1B',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="rounded-t-lg relative" style={{ overflowY: 'visible' }}>
          <Toolbar />
        </div>
        {showPreview ? (
          <div
            className="w-full px-3 sm:px-4 py-3 sm:py-4 text-white overflow-y-auto rounded-b-lg"
            style={{
              backgroundColor: '#090F1B',
              minHeight: '150px',
              maxHeight: '500px'
            }}
            dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
          />
        ) : (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full px-3 sm:px-4 py-3 sm:py-4 text-white placeholder-white/40 focus:outline-none transition-colors resize-none text-sm sm:text-base rounded-b-lg"
            style={{
              backgroundColor: '#090F1B',
              minHeight: '150px'
            }}
          />
        )}
      </div>
    </div>
  );
}

