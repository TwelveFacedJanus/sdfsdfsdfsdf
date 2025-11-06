# Generated manually for Notification model

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('UserService', '0005_user_password_reset_token_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Notification',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('notification_type', models.CharField(choices=[('subscription', 'Подписка'), ('unsubscription', 'Отписка'), ('new_post', 'Новый пост'), ('comment', 'Комментарий'), ('other', 'Другое')], default='other', max_length=20, verbose_name='Тип уведомления')),
                ('title', models.CharField(max_length=255, verbose_name='Заголовок')),
                ('message', models.TextField(verbose_name='Сообщение')),
                ('is_read', models.BooleanField(default=False, verbose_name='Прочитано')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')),
                ('related_user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='related_notifications', to='UserService.user', verbose_name='Связанный пользователь')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='notifications', to='UserService.user', verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Уведомление',
                'verbose_name_plural': 'Уведомления',
                'ordering': ['-created_at'],
            },
        ),
    ]

