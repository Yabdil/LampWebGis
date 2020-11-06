from  rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Lamp, Lamp_historique
from rest_framework import serializers

class LampSerializer(GeoFeatureModelSerializer):
    last_Modified_Lamp = serializers.SerializerMethodField()
    def get_last_Modified_Lamp(self,obj):
        if Lamp_historique.objects.filter(lamp=obj).exists():
            nb_lamp = Lamp_historique.objects.filter(lamp=obj).order_by('-created_At').first().number_off_lamp_Off
        else: 
            nb_lamp = 0        
        return nb_lamp
    class Meta:
        model = Lamp
        geo_field = "coord_X_Y"
        fields = '__all__'

class Lamp_historiqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lamp_historique
        fields = '__all__'
