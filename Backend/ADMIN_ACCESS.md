# Доступ к Django Admin

## ⚠️ ВАЖНО ДЛЯ ПРОДАКШЕНА

**НЕ используйте эти данные в production!**

Данные в `docker-compose.yml` предназначены только для разработки.

## Изменение данных суперпользователя

1. Отредактируйте `docker-compose.yml`:
```yaml
backend:
  environment:
    - DJANGO_SUPERUSER_EMAIL=your_secure@email.com
    - DJANGO_SUPERUSER_PASSWORD=your_very_strong_password
```

2. Перезапустите контейнеры:
```bash
docker-compose down -v  # -v удаляет volumes (включая БД)
docker-compose up -d
```

3. Для existing базы, удалите старого пользователя через Django shell:
```bash
docker-compose exec backend python /app/Source/manage.py shell
```

В shell:
```python
from UserService.models import User
User.objects.filter(email='admin@ezoterika.com').delete()
exit()
```

Затем перезапустите контейнеры.

## Альтернативный способ - через переменные окружения

Создайте файл `.env` в корне проекта:

```env
DJANGO_SUPERUSER_EMAIL=admin@yourdomain.com
DJANGO_SUPERUSER_PASSWORD=very_secure_password_here
```

И обновите `docker-compose.yml`:

```yaml
backend:
  env_file:
    - .env
```

## Безопасность в production

1. **Используйте сильный пароль** (минимум 20 символов)
2. **Не коммитьте `.env` в git**
3. **Используйте разные пароли** для dev/staging/production
4. **Включите 2FA** для админки (рекомендуется)
5. **Ограничьте доступ к админке** по IP адресам
6. **Используйте HTTPS** для всех подключений

## Проверка пользователей в базе

```bash
docker-compose exec backend python /app/Source/manage.py shell
```

В shell:
```python
from UserService.models import User

# Список всех суперпользователей
superusers = User.objects.filter(is_superuser=True, is_staff=True)
for user in superusers:
    print(f"Email: {user.email}, ФИО: {user.fio}")

# Проверка конкретного пользователя
user = User.objects.filter(email='admin@ezoterika.com').first()
if user:
    print(f"Найден: {user.email}, Суперпользователь: {user.is_superuser}, Staff: {user.is_staff}")
else:
    print("Пользователь не найден")
```

