# Ezoterika

Платформа для эзотерического контента

## Доступ в админку Django

После запуска проекта суперпользователь создается автоматически с такими данными:

- **URL админки:** `http://localhost:8000/admin/`
- **Email:** `admin@ezoterika.com`
- **Пароль:** `admin123`

### Ручное создание суперпользователя

Если нужно создать суперпользователя вручную:

```bash
# Через docker-compose
docker-compose exec backend python /app/Source/manage.py create_superuser --email admin@ezoterika.com --password admin123 --fio "Admin User"

# Или напрямую через Django
cd Backend/Source
python manage.py create_superuser --email your@email.com --password your_password --fio "Your Name"
```

### Изменение данных суперпользователя

Чтобы изменить email и пароль суперпользователя, отредактируйте файл `docker-compose.yml`:

```yaml
backend:
  environment:
    - DJANGO_SUPERUSER_EMAIL=your@email.com
    - DJANGO_SUPERUSER_PASSWORD=your_secure_password
```

После изменения перезапустите контейнеры:

```bash
docker-compose down
docker-compose up -d
```

## Запуск проекта

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка сервисов
docker-compose down
```

## Структура проекта

- **Backend/** - Django API сервер
- **Frontend/ezoterika/** - Next.js фронтенд
- **postgres/** - PostgreSQL база данных

## Технологии

### Backend
- Django 5.2.7
- Django REST Framework
- PostgreSQL
- JWT Authentication

### Frontend
- Next.js 16
- React 19
- TypeScript

## API Endpoints

### Пользователи
- `POST /api/user/sign-up/` - Регистрация
- `POST /api/user/sign-in/` - Вход
- `GET /api/user/profile/` - Профиль пользователя
- `PATCH /api/user/profile/` - Обновление профиля
- `POST /api/user/token/refresh/` - Обновление токена
- `POST /api/user/logout/` - Выход

### Контент
- `GET /api/content/posts/` - Список постов
- `GET /api/content/posts/{id}/` - Детали поста
- `POST /api/content/posts/create/` - Создание поста
- `GET /api/content/comments/` - Комментарии
- `POST /api/content/comments/create/` - Создание комментария

## Разработка

### Создание миграций

```bash
docker-compose exec backend python /app/Source/manage.py makemigrations
docker-compose exec backend python /app/Source/manage.py migrate
```

### Создание тестовых пользователей

```bash
docker-compose exec backend python /app/Source/manage.py create_test_users --count 10
```

### Shell Django

```bash
docker-compose exec backend python /app/Source/manage.py shell
```

## Лицензия

MIT
