from django.db import models
from django.contrib.gis.db import models
from django.contrib.gis.geos import GEOSGeometry

class Lamp(models.Model):
    name = models.CharField(max_length=20)
    station = models.CharField(max_length=50)
    coord_X_Y = models.PointField()

    def __str__(self):
        return self.name

from datetime import datetime
from django.utils   import timezone

class Lamp_historique(models.Model):
    lamp = models.ForeignKey(Lamp, on_delete=models.CASCADE)
    total = models.IntegerField()
    number_off_lamp_On = models.IntegerField()
    number_off_lamp_Off = models.IntegerField()
    created_At = models.DateTimeField(default=datetime.now, blank=True)
    hasCamera = models.BooleanField(default=False)
    hasWifi = models.BooleanField(default=False)
    comment = models.TextField()

    def __str__(self):
        return self.lamp.name
        
    



    



    
    