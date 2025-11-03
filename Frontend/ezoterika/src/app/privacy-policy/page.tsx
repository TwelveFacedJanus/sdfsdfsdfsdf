'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredTokens } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  useEffect(() => {
    const { accessToken } = getStoredTokens();
    if (!accessToken) {
      router.push('/signIn');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#282440] flex flex-col">
      <Header activePage="contents" />
      
      <main className="flex-1 max-w-[1920px] w-full mx-auto px-4 sm:px-6 lg:px-[50px] py-6 sm:py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-white text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 lg:mb-8">Политика конфиденциальности</h1>
          
          <div className="bg-[#0C1127] rounded-lg border p-4 sm:p-6 lg:p-8" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="prose prose-invert max-w-none">
              <section className="mb-6 sm:mb-8">
                <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">1. Общие положения</h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных 
                  пользователей веб-сайта Ezoterika (далее — «Сервис»). Использование Сервиса означает безоговорочное 
                  согласие пользователя с настоящей Политикой и указанными в ней условиями обработки его персональной информации.
                </p>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                  В случае несогласия с условиями Политики конфиденциальности пользователь должен прекратить использование Сервиса.
                </p>
              </section>

              <section className="mb-6 sm:mb-8">
                <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">2. Собираемая информация</h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  При использовании Сервиса мы можем собирать следующие виды информации:
                </p>
                <ul className="list-disc list-inside text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 space-y-2">
                  <li>Персональные данные: имя, фамилия, отчество, электронная почта, дата рождения</li>
                  <li>Профильная информация: аватар, никнейм, биография</li>
                  <li>Технические данные: IP-адрес, тип браузера, операционная система, данные об устройстве</li>
                  <li>Данные об активности: история просмотров, взаимодействия с контентом, предпочтения</li>
                  <li>Платежная информация: данные для обработки платежей (обрабатываются через защищенные платежные системы)</li>
                </ul>
              </section>

              <section className="mb-6 sm:mb-8">
                <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">3. Цели обработки данных</h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  Мы используем собранную информацию для следующих целей:
                </p>
                <ul className="list-disc list-inside text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 space-y-2">
                  <li>Предоставление и улучшение функционала Сервиса</li>
                  <li>Персонализация пользовательского опыта</li>
                  <li>Обработка платежей и управление подписками</li>
                  <li>Коммуникация с пользователями (уведомления, ответы на запросы)</li>
                  <li>Анализ использования Сервиса для улучшения качества</li>
                  <li>Обеспечение безопасности и предотвращение мошенничества</li>
                  <li>Соблюдение требований законодательства</li>
                </ul>
              </section>

              <section className="mb-6 sm:mb-8">
                <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">4. Защита данных</h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  Мы применяем современные методы защиты информации, включая:
                </p>
                <ul className="list-disc list-inside text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 space-y-2">
                  <li>Шифрование данных при передаче (HTTPS/TLS)</li>
                  <li>Безопасное хранение данных на защищенных серверах</li>
                  <li>Ограничение доступа к персональным данным только для авторизованного персонала</li>
                  <li>Регулярное обновление систем безопасности</li>
                  <li>Мониторинг и предотвращение несанкционированного доступа</li>
                </ul>
              </section>

              <section className="mb-6 sm:mb-8">
                <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">5. Передача данных третьим лицам</h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  Мы не продаем персональные данные пользователей. Мы можем передавать данные третьим лицам только в следующих случаях:
                </p>
                <ul className="list-disc list-inside text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 space-y-2">
                  <li>Провайдерам услуг, которые помогают нам в работе Сервиса (хостинг, аналитика, платежные системы)</li>
                  <li>По требованию законодательства или по запросу государственных органов</li>
                  <li>Для защиты наших прав и безопасности пользователей</li>
                  <li>С явного согласия пользователя</li>
                </ul>
                <p className="text-white/80 text-base leading-relaxed">
                  Все третьи лица, получающие доступ к данным, обязаны соблюдать требования конфиденциальности.
                </p>
              </section>

              <section className="mb-6 sm:mb-8">
                <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">6. Права пользователей</h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  Пользователи имеют право:
                </p>
                <ul className="list-disc list-inside text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4 space-y-2">
                  <li>Получать информацию о своих персональных данных</li>
                  <li>Требовать исправления неточных данных</li>
                  <li>Требовать удаления своих персональных данных</li>
                  <li>Ограничивать обработку персональных данных</li>
                  <li>Отозвать согласие на обработку данных</li>
                  <li>Подать жалобу в уполномоченный орган по защите персональных данных</li>
                </ul>
                <p className="text-white/80 text-base leading-relaxed">
                  Для реализации своих прав пользователь может обратиться к нам через форму обратной связи или на электронную почту.
                </p>
              </section>

              <section className="mb-6 sm:mb-8">
                <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">7. Cookies и аналогичные технологии</h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  Сервис использует cookies и аналогичные технологии для улучшения функционала и анализа использования. 
                  Пользователь может настроить свой браузер для отказа от cookies, однако это может ограничить функциональность Сервиса.
                </p>
              </section>

              <section className="mb-6 sm:mb-8">
                <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">8. Хранение данных</h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  Мы храним персональные данные в течение срока, необходимого для целей их обработки, или в течение срока, 
                  установленного законодательством. После истечения срока хранения данные удаляются или обезличиваются.
                </p>
              </section>

              <section className="mb-6 sm:mb-8">
                <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">9. Изменения в Политике конфиденциальности</h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  Мы оставляем за собой право вносить изменения в настоящую Политику конфиденциальности. 
                  Все изменения вступают в силу с момента их публикации на данной странице. 
                  Рекомендуем периодически просматривать эту страницу для ознакомления с актуальной информацией.
                </p>
              </section>

              <section className="mb-6 sm:mb-8">
                <h2 className="text-white text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4">10. Контакты</h2>
                <p className="text-white/80 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
                  По всем вопросам, связанным с обработкой персональных данных, вы можете обращаться:
                </p>
                <ul className="list-none text-white/80 text-sm sm:text-base leading-relaxed space-y-2">
                  <li>Электронная почта: privacy@ezoterika.com</li>
                  <li>Через форму обратной связи на сайте</li>
                </ul>
              </section>

              <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <p className="text-white/60 text-xs sm:text-sm">
                  Последнее обновление: {new Date().toLocaleDateString('ru-RU', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

