# Generated manually for PrivacyPolicy model

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('ContentService', '0004_post_accessibility'),
    ]

    operations = [
        migrations.CreateModel(
            name='PrivacyPolicy',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(default='Политика конфиденциальности', max_length=255, verbose_name='Заголовок')),
                ('content', models.TextField(verbose_name='Содержание (HTML)')),
                ('is_active', models.BooleanField(default=True, verbose_name='Активна')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Дата обновления')),
            ],
            options={
                'verbose_name': 'Политика конфиденциальности',
                'verbose_name_plural': 'Политики конфиденциальности',
                'ordering': ['-updated_at'],
            },
        ),
    ]

