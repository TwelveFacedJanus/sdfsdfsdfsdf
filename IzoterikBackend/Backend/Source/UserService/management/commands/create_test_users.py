from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()


class Command(BaseCommand):
    help = 'Создает тестовых пользователей с разными рейтингами'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=10,
            help='Количество пользователей для создания (по умолчанию 10)'
        )

    def handle(self, *args, **options):
        count = options['count']
        
        # Тестовые пользователи с разными рейтингами
        test_users = [
            {'fio': 'Анна Иванова', 'email': 'anna.ivanova@example.com', 'username': 'anna_ivanova', 'rating': 5},
            {'fio': 'Михаил Петров', 'email': 'mikhail.petrov@example.com', 'username': 'mikhail_petrov', 'rating': 4},
            {'fio': 'Елена Сидорова', 'email': 'elena.sidorova@example.com', 'username': 'elena_sidorova', 'rating': 4},
            {'fio': 'Дмитрий Козлов', 'email': 'dmitry.kozlov@example.com', 'username': 'dmitry_kozlov', 'rating': 3},
            {'fio': 'Ольга Морозова', 'email': 'olga.morozova@example.com', 'username': 'olga_morozova', 'rating': 3},
            {'fio': 'Алексей Волков', 'email': 'alexey.volkov@example.com', 'username': 'alexey_volkov', 'rating': 2},
            {'fio': 'Мария Новикова', 'email': 'maria.novikova@example.com', 'username': 'maria_novikova', 'rating': 2},
            {'fio': 'Сергей Лебедев', 'email': 'sergey.lebedev@example.com', 'username': 'sergey_lebedev', 'rating': 1},
            {'fio': 'Татьяна Соколова', 'email': 'tatyana.sokolova@example.com', 'username': 'tatyana_sokolova', 'rating': 1},
            {'fio': 'Игорь Попов', 'email': 'igor.popov@example.com', 'username': 'igor_popov', 'rating': 0},
            {'fio': 'Наталья Федорова', 'email': 'natalya.fedorova@example.com', 'username': 'natalya_fedorova', 'rating': 0},
            {'fio': 'Владимир Орлов', 'email': 'vladimir.orlov@example.com', 'username': 'vladimir_orlov', 'rating': 0},
            {'fio': 'Светлана Медведева', 'email': 'svetlana.medvedeva@example.com', 'username': 'svetlana_medvedeva', 'rating': 0},
            {'fio': 'Андрей Зайцев', 'email': 'andrey.zaytsev@example.com', 'username': 'andrey_zaytsev', 'rating': 0},
            {'fio': 'Юлия Романова', 'email': 'yulia.romanova@example.com', 'username': 'yulia_romanova', 'rating': 0},
        ]

        created_count = 0
        updated_count = 0

        with transaction.atomic():
            for i, user_data in enumerate(test_users[:count]):
                email = user_data['email']
                
                # Проверяем, существует ли пользователь
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'fio': user_data['fio'],
                        'username': user_data['username'],
                        'rating': user_data['rating'],
                        'is_active': True,
                    }
                )
                
                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Создан пользователь: {user.fio} (рейтинг: {user.rating})')
                    )
                else:
                    # Обновляем рейтинг существующего пользователя
                    user.rating = user_data['rating']
                    user.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'Обновлен пользователь: {user.fio} (рейтинг: {user.rating})')
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\nГотово! Создано: {created_count}, обновлено: {updated_count} пользователей'
            )
        )
        
        # Показываем статистику по рейтингам
        self.stdout.write('\nСтатистика по рейтингам:')
        for rating in range(6):  # 0-5
            count = User.objects.filter(rating=rating).count()
            if count > 0:
                self.stdout.write(f'Рейтинг {rating}: {count} пользователей')
