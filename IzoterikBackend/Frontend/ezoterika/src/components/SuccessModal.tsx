'use client';

import { useState } from 'react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export default function SuccessModal({ isOpen, onClose, onContinue }: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#302C50] bg-opacity-95 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1E1B33] rounded-xl p-8 max-w-md w-full mx-4 text-center space-y-6">
        {/* Иконка успеха */}
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-[#8A48D9] rounded-full flex items-center justify-center shadow-lg">
            <svg 
              className="w-16 h-16 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={3}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>

        {/* Сообщение об успехе */}
        <div>
          <h2 className="text-white text-xl font-medium">
            Регистрация успешно пройдена
          </h2>
        </div>

        {/* Кнопка продолжения */}
        <button
          onClick={onContinue}
          className="w-full bg-[#8A48D9] text-white py-3 rounded-lg font-medium hover:bg-[#7A38C9] transition-colors"
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}
