# Generated by Django 3.1.2 on 2020-10-21 12:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('geoapi', '0005_auto_20201020_2306'),
    ]

    operations = [
        migrations.CreateModel(
            name='Lamp_historique',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('total', models.IntegerField()),
                ('number_off_lamp_On', models.IntegerField()),
                ('number_off_lamp_Off', models.IntegerField()),
                ('hasCamera', models.BooleanField(default=False)),
                ('hasWifi', models.BooleanField(default=False)),
                ('comment', models.TextField()),
                ('lamp', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='geoapi.lamp')),
            ],
        ),
    ]
