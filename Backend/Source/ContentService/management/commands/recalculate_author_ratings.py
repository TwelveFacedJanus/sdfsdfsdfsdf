from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db.models import Avg
from ContentService.models import Post

User = get_user_model()


class Command(BaseCommand):
    help = 'Пересчитывает рейтинги всех авторов на основе среднего рейтинга их опубликованных постов'

    def handle(self, *args, **options):
        self.stdout.write('Начинаем пересчет рейтингов авторов...')
        
        updated_count = 0
        zero_count = 0
        
        # Получаем всех пользователей, у которых есть опубликованные посты
        authors = User.objects.filter(posts__is_published=True).distinct()
        
        for author in authors:
            # Получаем средний рейтинг всех опубликованных постов автора
            avg_rating = Post.objects.filter(
                author=author,
                is_published=True
            ).aggregate(Avg('rating'))['rating__avg']
            
            if avg_rating is not None and avg_rating > 0:
                # Сохраняем как целое число * 10 (4.5 -> 45)
                author.rating = round(avg_rating * 10)
                updated_count += 1
            else:
                author.rating = 0
                zero_count += 1
            
            author.save(update_fields=['rating'])
            self.stdout.write(
                self.style.SUCCESS(
                    f'Автор {author.fio}: рейтинг обновлен до {author.rating / 10.0:.1f}'
                )
            )
        
        # Обновляем рейтинги авторов без опубликованных постов
        authors_without_posts = User.objects.exclude(
            id__in=Post.objects.filter(is_published=True).values_list('author_id', flat=True).distinct()
        )
        
        for author in authors_without_posts:
            if author.rating != 0:
                author.rating = 0
                author.save(update_fields=['rating'])
                zero_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nГотово! Обновлено рейтингов: {updated_count}, установлено в 0: {zero_count}'
            )
        )

