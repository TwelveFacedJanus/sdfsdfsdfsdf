from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
import base64

User = get_user_model()


class Command(BaseCommand):
    help = 'Добавляет тестовые аватарки пользователям'

    def handle(self, *args, **options):
        # Простые SVG аватарки в base64
        avatars = {
            'anna.ivanova@example.com': self.create_simple_avatar('А', '#FF6B6B'),
            'mikhail.petrov@example.com': self.create_simple_avatar('М', '#4ECDC4'),
            'elena.sidorova@example.com': self.create_simple_avatar('Е', '#45B7D1'),
            'dmitry.kozlov@example.com': self.create_simple_avatar('Д', '#96CEB4'),
            'olga.morozova@example.com': self.create_simple_avatar('О', '#FFEAA7'),
            'alexey.volkov@example.com': self.create_simple_avatar('А', '#DDA0DD'),
            'maria.novikova@example.com': self.create_simple_avatar('М', '#98D8C8'),
            'sergey.lebedev@example.com': self.create_simple_avatar('С', '#F7DC6F'),
            'tatyana.sokolova@example.com': self.create_simple_avatar('Т', '#BB8FCE'),
            'igor.popov@example.com': self.create_simple_avatar('И', '#85C1E9'),
            'natalya.fedorova@example.com': self.create_simple_avatar('Н', '#F8C471'),
            'vladimir.orlov@example.com': self.create_simple_avatar('В', '#82E0AA'),
            'svetlana.medvedeva@example.com': self.create_simple_avatar('С', '#F1948A'),
            'andrey.zaytsev@example.com': self.create_simple_avatar('А', '#85C1E9'),
            'yulia.romanova@example.com': self.create_simple_avatar('Ю', '#D7BDE2'),
        }

        updated_count = 0

        with transaction.atomic():
            for email, avatar_base64 in avatars.items():
                try:
                    user = User.objects.get(email=email)
                    user.base64_image = avatar_base64
                    user.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Добавлена аватарка для: {user.fio}')
                    )
                except User.DoesNotExist:
                    self.stdout.write(
                        self.style.WARNING(f'Пользователь с email {email} не найден')
                    )

        self.stdout.write(
            self.style.SUCCESS(f'\nГотово! Обновлено аватарок: {updated_count}')
        )

    def create_simple_avatar(self, initial, color):
        """Создает простую SVG аватарку с инициалом"""
        svg_content = f'''
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="{color}"/>
            <text x="50" y="60" font-family="Arial, sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="white">{initial}</text>
        </svg>
        '''
        
        # Конвертируем SVG в base64
        svg_bytes = svg_content.encode('utf-8')
        base64_string = base64.b64encode(svg_bytes).decode('utf-8')
        
        # Возвращаем data URL
        return f"data:image/svg+xml;base64,{base64_string}"
