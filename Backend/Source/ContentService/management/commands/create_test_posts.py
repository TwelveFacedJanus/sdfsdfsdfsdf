from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from ContentService.models import Post
import random

User = get_user_model()


class Command(BaseCommand):
    help = 'Создает тестовые посты для разных категорий'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=20,
            help='Количество постов для создания (по умолчанию 20)'
        )

    def handle(self, *args, **options):
        count = options['count']
        
        # Тестовые посты с разными категориями
        test_posts = [
            {
                'title': 'Тайны магии: Искусство превращений и волшебства в нашей жизни',
                'preview_text': 'Исследуем древние практики магии и их влияние на современную жизнь. Откройте для себя секреты трансформации и духовного роста.',
                'content': '# Тайны магии\n\nМагия - это искусство изменения реальности через силу воли и намерения...',
                'category': 'esoterics',
                'rating': 4.8,
                'views_count': 1250,
                'comments_count': 23
            },
            {
                'title': 'Астрологический прогноз на месяц: Влияние планет на вашу жизнь',
                'preview_text': 'Узнайте, как планеты влияют на вашу жизнь в этом месяце. Подробный анализ аспектов и рекомендации.',
                'content': '# Астрологический прогноз\n\nВ этом месяце особое внимание стоит уделить...',
                'category': 'astrology',
                'rating': 4.5,
                'views_count': 980,
                'comments_count': 18
            },
            {
                'title': 'Расклад Таро "Кельтский крест": Полное руководство',
                'preview_text': 'Изучите один из самых популярных раскладов Таро. Пошаговое руководство с интерпретацией каждой позиции.',
                'content': '# Расклад "Кельтский крест"\n\nЭтот расклад поможет получить глубокое понимание...',
                'category': 'tarot',
                'rating': 4.7,
                'views_count': 2100,
                'comments_count': 45
            },
            {
                'title': 'Нумерология имени: Как числа влияют на вашу судьбу',
                'preview_text': 'Откройте тайны вашего имени через нумерологию. Узнайте, какие числа определяют вашу личность.',
                'content': '# Нумерология имени\n\nКаждая буква имеет свое числовое значение...',
                'category': 'numerology',
                'rating': 4.3,
                'views_count': 750,
                'comments_count': 12
            },
            {
                'title': 'Медитация для начинающих: С чего начать духовный путь',
                'preview_text': 'Практическое руководство по медитации для тех, кто только начинает свой духовный путь.',
                'content': '# Медитация для начинающих\n\nМедитация - это искусство внутреннего покоя...',
                'category': 'meditation',
                'rating': 4.6,
                'views_count': 1650,
                'comments_count': 31
            },
            {
                'title': 'Духовное пробуждение: Признаки и этапы развития',
                'preview_text': 'Узнайте о признаках духовного пробуждения и этапах развития сознания.',
                'content': '# Духовное пробуждение\n\nДуховное пробуждение - это процесс расширения сознания...',
                'category': 'spirituality',
                'rating': 4.9,
                'views_count': 3200,
                'comments_count': 67
            },
            {
                'title': 'Кристаллы и их энергетические свойства',
                'preview_text': 'Исследуем мир кристаллов и их влияние на энергетику человека.',
                'content': '# Кристаллы и их свойства\n\nКристаллы обладают уникальными энергетическими свойствами...',
                'category': 'esoterics',
                'rating': 4.4,
                'views_count': 890,
                'comments_count': 19
            },
            {
                'title': 'Лунные фазы и их влияние на эмоции',
                'preview_text': 'Как лунные циклы влияют на наше эмоциональное состояние и поведение.',
                'content': '# Лунные фазы\n\nЛуна оказывает мощное влияние на эмоциональную сферу...',
                'category': 'astrology',
                'rating': 4.2,
                'views_count': 1100,
                'comments_count': 25
            },
            {
                'title': 'Карты Таро: Значение Старших Арканов',
                'preview_text': 'Подробное описание Старших Арканов Таро и их символического значения.',
                'content': '# Старшие Арканы\n\nСтаршие Арканы представляют основные жизненные уроки...',
                'category': 'tarot',
                'rating': 4.8,
                'views_count': 1800,
                'comments_count': 38
            },
            {
                'title': 'Число жизненного пути: Расчет и значение',
                'preview_text': 'Узнайте свое число жизненного пути и его влияние на вашу судьбу.',
                'content': '# Число жизненного пути\n\nЭто число раскрывает вашу основную жизненную цель...',
                'category': 'numerology',
                'rating': 4.5,
                'views_count': 1400,
                'comments_count': 28
            },
            {
                'title': 'Техники дыхания в медитации',
                'preview_text': 'Различные техники дыхания для углубления медитативной практики.',
                'content': '# Техники дыхания\n\nПравильное дыхание - основа успешной медитации...',
                'category': 'meditation',
                'rating': 4.7,
                'views_count': 950,
                'comments_count': 21
            },
            {
                'title': 'Чакры: Энергетические центры человека',
                'preview_text': 'Изучаем систему чакр и их влияние на физическое и духовное здоровье.',
                'content': '# Система чакр\n\nЧакры - это энергетические центры в теле человека...',
                'category': 'spirituality',
                'rating': 4.6,
                'views_count': 2200,
                'comments_count': 42
            },
            {
                'title': 'Ритуалы очищения пространства',
                'preview_text': 'Практические методы очищения энергетики дома и рабочего места.',
                'content': '# Ритуалы очищения\n\nОчищение пространства важно для поддержания позитивной энергии...',
                'category': 'esoterics',
                'rating': 4.3,
                'views_count': 1200,
                'comments_count': 26
            },
            {
                'title': 'Астрология совместимости: Анализ отношений',
                'preview_text': 'Как астрология помогает понять совместимость в отношениях.',
                'content': '# Астрология совместимости\n\nАнализ натальных карт партнеров помогает понять...',
                'category': 'astrology',
                'rating': 4.4,
                'views_count': 1600,
                'comments_count': 33
            },
            {
                'title': 'Таро для ежедневных вопросов',
                'preview_text': 'Простые расклады Таро для решения повседневных вопросов.',
                'content': '# Ежедневные расклады\n\nТаро может быть полезным инструментом для ежедневных решений...',
                'category': 'tarot',
                'rating': 4.1,
                'views_count': 800,
                'comments_count': 16
            },
            {
                'title': 'Магические числа в нумерологии',
                'preview_text': 'Значение особых чисел и их влияние на жизнь человека.',
                'content': '# Магические числа\n\nНекоторые числа обладают особой силой и значением...',
                'category': 'numerology',
                'rating': 4.0,
                'views_count': 700,
                'comments_count': 14
            },
            {
                'title': 'Медитация осознанности: Практические упражнения',
                'preview_text': 'Техники медитации осознанности для развития внимательности.',
                'content': '# Медитация осознанности\n\nОсознанность - это способность быть полностью присутствующим...',
                'category': 'meditation',
                'rating': 4.8,
                'views_count': 1900,
                'comments_count': 35
            },
            {
                'title': 'Духовные практики разных культур',
                'preview_text': 'Обзор духовных практик различных культур и традиций.',
                'content': '# Духовные практики мира\n\nКаждая культура имеет свои уникальные духовные практики...',
                'category': 'spirituality',
                'rating': 4.5,
                'views_count': 1300,
                'comments_count': 29
            },
            {
                'title': 'Энергетическая защита: Методы и техники',
                'preview_text': 'Как защитить себя от негативной энергии и энергетических атак.',
                'content': '# Энергетическая защита\n\nЗащита от негативной энергии важна для духовного благополучия...',
                'category': 'esoterics',
                'rating': 4.7,
                'views_count': 2500,
                'comments_count': 48
            },
            {
                'title': 'Астрология и здоровье: Связь планет с органами',
                'preview_text': 'Как планеты влияют на здоровье и какие органы находятся под их управлением.',
                'content': '# Астрология и здоровье\n\nКаждая планета управляет определенными органами...',
                'category': 'astrology',
                'rating': 4.2,
                'views_count': 1050,
                'comments_count': 22
            }
        ]

        created_count = 0
        updated_count = 0

        # Получаем всех пользователей для случайного назначения авторов
        users = list(User.objects.all())
        if not users:
            self.stdout.write(
                self.style.ERROR('Нет пользователей в базе данных. Сначала создайте пользователей.')
            )
            return

        with transaction.atomic():
            for i, post_data in enumerate(test_posts[:count]):
                # Случайно выбираем автора
                author = random.choice(users)
                
                # Проверяем, существует ли пост с таким заголовком
                post, created = Post.objects.get_or_create(
                    title=post_data['title'],
                    defaults={
                        'preview_text': post_data['preview_text'],
                        'content': post_data['content'],
                        'category': post_data['category'],
                        'rating': post_data['rating'],
                        'views_count': post_data['views_count'],
                        'comments_count': post_data['comments_count'],
                        'author': author,
                        'is_published': True,
                    }
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Создан пост: {post.title} (автор: {post.author.fio}, категория: {post.category})')
                    )
                else:
                    # Обновляем данные существующего поста
                    post.rating = post_data['rating']
                    post.views_count = post_data['views_count']
                    post.comments_count = post_data['comments_count']
                    post.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'Обновлен пост: {post.title}')
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nГотово! Создано: {created_count}, обновлено: {updated_count} постов'
            )
        )
        
        # Показываем статистику по категориям
        self.stdout.write('\nСтатистика по категориям:')
        for category_code, category_name in Post.CATEGORY_CHOICES:
            count = Post.objects.filter(category=category_code).count()
            if count > 0:
                self.stdout.write(f'{category_name} ({category_code}): {count} постов')
