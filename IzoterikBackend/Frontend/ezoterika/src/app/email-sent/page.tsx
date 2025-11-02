'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function EmailSentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#282440' }}>
      <div 
        className="flex flex-col items-center justify-center p-10 text-center"
        style={{
          backgroundColor: '#0C1127',
          width: '600px',
          minHeight: '400px',
          gap: '32px'
        }}
      >
        {/* Email Icon */}
        <Image
          src="/email_verify.png"
          alt="Email verification"
          width={120}
          height={120}
          className="mb-4"
        />

        {/* Success Message */}
        <div className="flex flex-col gap-2">
          <h1 className="text-white text-2xl font-bold">
            Ссылка для подтверждения почты.
          </h1>
          <p className="text-white text-lg">
            Перейдите по ссылке и следуйте дальнейшим инструкциям.
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={() => router.push('/signIn')}
          className="px-8 py-3 text-white font-medium transition-colors hover:opacity-90"
          style={{ 
            borderRadius: '360px',
            backgroundColor: '#8A63D2'
          }}
        >
          Продолжить
        </button>
      </div>
    </div>
  );
}
