from django.test import TestCase,Client
from .models import Lamp_historique, Lamp
from datetime import datetime


class LampTest(TestCase):
    def setUp(self):
        lamp = Lamp.objects.create(name='LTY F', station='station1',coord_X_Y='POINT(-95.3385 29.7245)')
        lamphistorique1 = Lamp_historique.objects.create(lamp=lamp, total=20, number_off_lamp_Off=10, number_off_lamp_On=10,created_At=datetime.now(),hasCamera=False,hasWifi=True,comment='hahahah')
        lamphistorique2 = Lamp_historique.objects.create(lamp=lamp, total=20, number_off_lamp_Off=10, number_off_lamp_On=10,created_At=datetime.now(),hasCamera=False,hasWifi=True,comment='hahahah')

    def getLampObject(self):
        self.lamp = Lamp.objects.all().first()
        Lhistorique = Lamp_historique.objects.all().first()
        self.assertEqual(self.lamp,Lhistorique.lamp)

    def getlatestLamphistorique(self):
        lamphistorique1 = Lamp_historique.objects.all().order_by('-created_At').first()
        lastData = Lamp_historique.objects.all().order_by('created_At').latest().created_At
        self.assertEqual(lamphistorique1.created_At, lastData)




