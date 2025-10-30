'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredTokens } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (accessToken) {
      // Если пользователь авторизован, перенаправляем на страницу с контентом
      router.push('/contents');
    } else {
      // Если не авторизован, перенаправляем на страницу входа
      router.push('/signIn');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#282440] flex items-center justify-center">
      <div className="text-white text-xl">Перенаправление...</div>
    </div>
  );
}
