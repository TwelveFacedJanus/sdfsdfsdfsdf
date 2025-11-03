'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#171B27] border-t" style={{ borderTopWidth: '1px', borderTopColor: 'rgba(255, 255, 255, 0.05)' }}>
      <div className="max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-[50px]">
        <div className="flex flex-col md:flex-row items-center justify-between py-6 md:py-8 gap-4 md:gap-6">
          {/* Логотип и копирайт */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <img 
              src="/logo.svg" 
              alt="Ezoterika Logo" 
              className="h-6 md:h-8 w-auto opacity-70"
            />
            <span className="text-white/60 text-xs sm:text-sm">
              © {currentYear} Ezoterika. Все права защищены.
            </span>
          </div>

          {/* Ссылки */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-6">
            <a 
              href="/privacy-policy" 
              className="text-white/60 hover:text-white transition-colors text-xs sm:text-sm"
            >
              Политика конфиденциальности
            </a>
            <a 
              href="/terms" 
              className="text-white/60 hover:text-white transition-colors text-xs sm:text-sm"
            >
              Условия использования
            </a>
            <a 
              href="/contact" 
              className="text-white/60 hover:text-white transition-colors text-xs sm:text-sm"
            >
              Контакты
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

