# Generated by Django 3.1.2 on 2020-10-20 00:48

import django.contrib.gis.db.models.fields
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('leshab', '0003_linesm'),
    ]

    operations = [
        migrations.AlterField(
            model_name='linesm',
            name='polyg',
            field=django.contrib.gis.db.models.fields.PolygonField(blank=True, srid=4326),
        ),
    ]