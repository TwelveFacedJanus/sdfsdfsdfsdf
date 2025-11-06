'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredTokens, getPrivacyPolicy } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const [policy, setPolicy] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      router.push('/signIn');
      return;
    }
    
    loadPrivacyPolicy();
  }, [router]);

  const loadPrivacyPolicy = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPrivacyPolicy();
      setPolicy(response);
    } catch (error: any) {
      console.error('Error loading privacy policy:', error);
      setError(error.message || 'Ошибка при загрузке политики конфиденциальности');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#282440] flex flex-col">
      <Header activePage="contents" />
      
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-[50px] py-6 sm:py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-white text-lg">Загрузка...</div>
            </div>
          ) : error ? (
            <div className="bg-[#0C1127] rounded-lg border p-6" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
              <div className="text-red-400 text-center">{error}</div>
            </div>
          ) : policy ? (
            <>
              <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">
                {policy.title || 'Политика конфиденциальности'}
              </h1>
              
              <div className="bg-[#0C1127] rounded-lg border p-4 sm:p-6 lg:p-8" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                <div 
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: policy.content }}
                />
                
                {policy.updated_at && (
                  <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <p className="text-white/60 text-xs sm:text-sm">
                      Последнее обновление: {new Date(policy.updated_at).toLocaleDateString('ru-RU', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-[#0C1127] rounded-lg border p-6" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
              <div className="text-white/80 text-center">Политика конфиденциальности не найдена</div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

