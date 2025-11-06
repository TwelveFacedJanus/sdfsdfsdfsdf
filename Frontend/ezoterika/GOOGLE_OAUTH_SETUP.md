# Настройка Google OAuth

## Ошибка "no registered origin" / "invalid_client" / "origin_mismatch"

Эта ошибка возникает, когда домен приложения не добавлен в список разрешенных источников в Google Cloud Console.

**⚠️ ВАЖНО:** Google OAuth проверяет origin **с портом**! Если ваше приложение работает на `http://queltest.space:3000`, то в **Authorized JavaScript origins** нужно добавить именно `http://queltest.space:3000` (с портом), а не просто `http://queltest.space`.

## Инструкция по настройке:

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Выберите проект или создайте новый
3. Перейдите в **APIs & Services** → **Credentials**
4. Найдите или создайте OAuth 2.0 Client ID
5. В настройках клиента добавьте следующие **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - `http://103.228.171.39:3000`
   - `https://103.228.171.39:3000` (если используется HTTPS)
   - `http://queltest.space:3000`
   - `https://queltest.space:3000` (если используется HTTPS)
6. Добавьте **Authorized redirect URIs**:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - `http://103.228.171.39:3000`
   - `https://103.228.171.39:3000` (если используется HTTPS)
   - `http://queltest.space:3000`
   - `https://queltest.space:3000` (если используется HTTPS)
7. Сохраните изменения
8. Убедитесь, что используете правильный Client ID: `936084880439-2jfpq9aih9dpkf8dgn5i5jd8u8o7bv2h.apps.googleusercontent.com`

## Важно:

- **КРИТИЧЕСКИ ВАЖНО:** Origin должен точно совпадать с URL вашего приложения, включая порт! 
  - Если приложение на `http://queltest.space:3000` → добавьте `http://queltest.space:3000` (с портом!)
  - Если приложение на `http://queltest.space` → добавьте `http://queltest.space` (без порта)
- Изменения в Google Cloud Console могут применяться до 5-10 минут
- Убедитесь, что тип приложения - **Web application**
- Не используйте Client ID для мобильных приложений в веб-приложении
- Если вы видите ошибку "origin_mismatch", проверьте точное совпадение origin (протокол + домен + порт)

## Проверка:

После настройки перезагрузите страницу и попробуйте авторизоваться через Google снова.

