from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
import os

User = get_user_model()


class Command(BaseCommand):
    help = 'Создает суперпользователя Django для доступа в админку'

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default=None,
            help='Email суперпользователя (по умолчанию из DJANGO_SUPERUSER_EMAIL env var)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default=None,
            help='Пароль суперпользователя (по умолчанию из DJANGO_SUPERUSER_PASSWORD env var)'
        )
        parser.add_argument(
            '--fio',
            type=str,
            default='Admin',
            help='ФИО суперпользователя (по умолчанию "Admin")'
        )

    def handle(self, *args, **options):
        email = options.get('email') or os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = options.get('password') or os.environ.get('DJANGO_SUPERUSER_PASSWORD')
        fio = options.get('fio', 'Admin')
        
        if not email:
            self.stdout.write(
                self.style.ERROR('Требуется указать email через --email или переменную DJANGO_SUPERUSER_EMAIL')
            )
            return
        
        if not password:
            self.stdout.write(
                self.style.ERROR('Требуется указать пароль через --password или переменную DJANGO_SUPERUSER_PASSWORD')
            )
            return
        
        # Проверяем, существует ли уже суперпользователь с этим email
        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(f'Пользователь с email {email} уже существует')
            )
            return
        
        # Создаем суперпользователя
        try:
            user = User.objects.create_superuser(
                email=email,
                password=password,
                fio=fio,
                username=email,  # Username должен быть уникальным
            )
            self.stdout.write(
                self.style.SUCCESS(f'✅ Суперпользователь успешно создан!')
            )
            self.stdout.write(
                self.style.SUCCESS(f'   Email: {user.email}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'   ФИО: {user.fio}')
            )
            self.stdout.write(
                self.style.SUCCESS(f'   Доступ в админку: /admin/')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Ошибка при создании суперпользователя: {e}')
            )

