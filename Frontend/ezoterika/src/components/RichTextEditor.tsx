'use client';

import { useRef, useState } from 'react';

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
  const [currentHeading, setCurrentHeading] = useState(defaultHeading);

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

  const Toolbar = () => (
    <div 
      className="flex items-center gap-2 p-3 border-b"
      style={{
        backgroundColor: '#1A1A1A',
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Heading selector - dropdown style */}
      <div className="flex items-center gap-1 text-white/70 text-sm font-medium px-2 py-1 cursor-pointer hover:text-white">
        <span>{currentHeading}</span>
        <div className="flex flex-col -space-y-1">
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 12 12">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6L6 3L9 6" />
          </svg>
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 12 12">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6L6 9L9 6" />
          </svg>
        </div>
      </div>

      <div className="h-4 w-px mx-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Bold */}
      <button
        type="button"
        onClick={handleBold}
        className="px-2 py-1 text-white/70 text-sm font-bold hover:text-white hover:bg-white/5 rounded transition-colors"
        title="Жирный"
      >
        B
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={handleItalic}
        className="px-2 py-1 text-white/70 text-sm italic hover:text-white hover:bg-white/5 rounded transition-colors"
        title="Курсив"
      >
        I
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={handleUnderline}
        className="px-2 py-1 text-white/70 text-sm underline hover:text-white hover:bg-white/5 rounded transition-colors"
        title="Подчеркнутый"
      >
        U
      </button>

      <div className="h-4 w-px mx-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Link */}
      <button
        type="button"
        onClick={handleLink}
        className="p-1 text-white/70 hover:text-white hover:bg-white/5 rounded transition-colors"
        title="Ссылка"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </button>

      <div className="h-4 w-px mx-1" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />

      {/* Bullet list */}
      <button
        type="button"
        onClick={handleList}
        className="p-1 text-white/70 hover:text-white hover:bg-white/5 rounded transition-colors"
        title="Маркированный список"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="4" cy="6" r="1" fill="currentColor" />
          <circle cx="4" cy="12" r="1" fill="currentColor" />
          <circle cx="4" cy="18" r="1" fill="currentColor" />
          <line x1="8" y1="6" x2="20" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="12" x2="20" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <line x1="8" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="w-full">
      {/* Label */}
      <div className="mb-2">
        <span className="text-sm text-white/70">{label}</span>
      </div>
      
      {/* Editor container */}
      <div 
        className="rounded-lg overflow-hidden border"
        style={{
          backgroundColor: '#090F1B',
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <Toolbar />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full px-4 py-4 text-white placeholder-white/40 focus:outline-none transition-colors resize-none"
          style={{
            backgroundColor: '#090F1B',
            minHeight: '200px'
          }}
        />
      </div>
    </div>
  );
}

