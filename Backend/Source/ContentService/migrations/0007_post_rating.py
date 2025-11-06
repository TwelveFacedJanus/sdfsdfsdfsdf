# Generated manually for PostRating model

from django.db import migrations, models
import django.db.models.deletion
import django.core.validators
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('ContentService', '0006_change_preview_image_link_to_textfield'),
        ('UserService', '0006_notification'),
    ]

    operations = [
        migrations.CreateModel(
            name='PostRating',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('rating', models.DecimalField(decimal_places=1, max_digits=2, validators=[django.core.validators.MinValueValidator(0.0), django.core.validators.MaxValueValidator(5.0)], verbose_name='Оценка')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Дата обновления')),
                ('post', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='ratings', to='ContentService.post', verbose_name='Пост')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='post_ratings', to='UserService.user', verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Оценка поста',
                'verbose_name_plural': 'Оценки постов',
                'ordering': ['-created_at'],
                'unique_together': {('post', 'user')},
            },
        ),
    ]

