# Настройка Google OAuth

## Ошибка "no registered origin" / "invalid_client"

Эта ошибка возникает, когда домен приложения не добавлен в список разрешенных источников в Google Cloud Console.

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
6. Добавьте **Authorized redirect URIs**:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
   - `http://103.228.171.39:3000`
   - `https://103.228.171.39:3000` (если используется HTTPS)
7. Сохраните изменения
8. Убедитесь, что используете правильный Client ID: `936084880439-2jfpq9aih9dpkf8dgn5i5jd8u8o7bv2h.apps.googleusercontent.com`

## Важно:

- Изменения в Google Cloud Console могут применяться до 5-10 минут
- Убедитесь, что тип приложения - **Web application**
- Не используйте Client ID для мобильных приложений в веб-приложении

## Проверка:

После настройки перезагрузите страницу и попробуйте авторизоваться через Google снова.

