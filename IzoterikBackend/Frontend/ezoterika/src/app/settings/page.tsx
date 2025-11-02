'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправляем на страницу профиля с активной секцией "Настройки"
    router.replace('/profile?section=settings');
  }, [router]);

  // Показываем заглушку во время перенаправления
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#090F1B' }}>
      <div className="text-white">Перенаправление...</div>
    </div>
  );
}

