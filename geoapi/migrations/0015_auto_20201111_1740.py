# Generated by Django 3.1.2 on 2020-11-11 17:40

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('geoapi', '0014_auto_20201111_1711'),
    ]

    operations = [
        migrations.AlterField(
            model_name='lamp_historique',
            name='created_At',
            field=models.DateTimeField(blank=True, default=datetime.datetime.now),
        ),
    ]