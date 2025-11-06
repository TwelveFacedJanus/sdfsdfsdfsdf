# Generated manually to change preview_image_link from URLField to TextField

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ContentService', '0005_privacy_policy'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='preview_image_link',
            field=models.TextField(blank=True, null=True, verbose_name='Ссылка на превью изображение (URL или base64)'),
        ),
    ]

