# Generated by Django 3.1.2 on 2020-11-11 13:11

import datetime
from django.db import migrations, models
from django.utils.timezone import utc


class Migration(migrations.Migration):

    dependencies = [
        ('geoapi', '0011_auto_20201111_1241'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lamp_historique',
            name='created_At',
            field=models.DateTimeField(default=datetime.datetime(2020, 11, 11, 13, 11, 46, 307790, tzinfo=utc)),
        ),
    ]
