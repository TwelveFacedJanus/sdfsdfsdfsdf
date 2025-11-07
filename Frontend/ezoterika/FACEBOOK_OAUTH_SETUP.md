# Настройка Facebook OAuth 2.0

## Инструкция по настройке Facebook App для авторизации

### 1. Включить "Login with SDK JavaScript"
- В настройках Facebook App перейдите в раздел **"Login with Facebook"** → **"Allowed Domains for SDK JavaScript"**
- Включите переключатель **"Login with SDK JavaScript"** (установите в "Да")

### 2. Добавить разрешенные домены для SDK JavaScript
В поле **"Разрешенные домены для SDK JavaScript"** добавьте ваши домены (без протокола и порта):
```
localhost
queltest.space
103.228.171.39
```

**Важно:** Добавляйте домены без `http://`, `https://` и без порта.

### 3. Добавить Valid OAuth Redirect URIs
В разделе **"Valid OAuth Redirect URIs"** добавьте полные URL с протоколом и портом:
```
http://localhost:3000
http://queltest.space:3000
https://queltest.space:3000
http://103.228.171.39:3000
https://103.228.171.39:3000
```

**Важно:** 
- Добавляйте полные URL с протоколом (`http://` или `https://`)
- Если используете порт (например, `:3000`), обязательно укажите его
- Каждый URL должен быть на отдельной строке или разделен запятыми

### 4. Проверить настройки OAuth
Убедитесь, что следующие настройки включены:
- ✅ **Client OAuth Authorization** — Да
- ✅ **Web OAuth Authorization** — Да
- ✅ **Use Strict Mode for Redirect URI** — Да (рекомендуется)
- ✅ **Require HTTPS** — Да (рекомендуется для продакшена)

### 5. Получить App ID
1. Перейдите в **Settings** → **Basic** в вашем Facebook App
2. Скопируйте **App ID**
3. Добавьте его в файл `.env.local`:
```
NEXT_PUBLIC_FACEBOOK_APP_ID=817819464543055
```

### 6. Настроить App Domains (опционально)
В разделе **Settings** → **Basic** → **App Domains** добавьте:
```
queltest.space
localhost
```

### Важные замечания:
- После изменения настроек может потребоваться несколько минут для их применения
- Убедитесь, что ваш Facebook App находится в режиме **Development** или **Live** (в зависимости от ваших потребностей)
- Для локальной разработки используйте `localhost`
- Для продакшена обязательно используйте HTTPS и добавьте домен с `https://`

### Проверка настроек:
После настройки проверьте:
1. Откройте страницу регистрации/входа
2. Нажмите кнопку "Продолжить с Facebook"
3. Должно открыться окно авторизации Facebook
4. После успешной авторизации пользователь должен быть перенаправлен в приложение

### Возможные ошибки:
- **"App Not Setup"** — проверьте, что App ID правильный и приложение активно
- **"Invalid OAuth Redirect URI"** — проверьте, что URL точно совпадает с одним из Valid OAuth Redirect URIs
- **"Domain Not Allowed"** — проверьте, что домен добавлен в "Allowed Domains for SDK JavaScript"

