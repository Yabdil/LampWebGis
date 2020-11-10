from  rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Lamp, Lamp_historique
from rest_framework import serializers

class LampSerializer(GeoFeatureModelSerializer):
    LampDiff = serializers.SerializerMethodField()
    def get_LampDiff(self,obj):
        LampDiff = 0
        if Lamp_historique.objects.filter(lamp=obj).exists():
            lamp = Lamp_historique.objects.filter(lamp=obj).order_by('-created_At').first()
            LampDiff = lamp.number_off_lamp_On - lamp.number_off_lamp_Off      
        return LampDiff # if not existing by default we take 0
    class Meta:
        model = Lamp
        geo_field = "coord_X_Y"
        fields = '__all__'

class Lamp_historiqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lamp_historique
        fields = '__all__'