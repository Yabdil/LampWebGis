# Generated by Django 3.1.2 on 2020-11-11 13:16

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('geoapi', '0012_auto_20201111_1411'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lamp_historique',
            name='created_At',
            field=models.DateTimeField(default=datetime.datetime(2020, 11, 11, 13, 16, 22, 414354, tzinfo=utc)),
        ),
    ]
