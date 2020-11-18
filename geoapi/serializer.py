from  rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Lamp, Lamp_historique
from rest_framework import serializers

class LampSerializer(GeoFeatureModelSerializer):
    diff = serializers.SerializerMethodField()
    def get_diff(self,obj):
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
        
    def validate(self, data):
        lamp = data['lamp']
        obj = Lamp_historique.objects.filter(lamp=lamp).order_by('created_At')
        if len(total) > 0:
            if data['total'] != obj.first().total:
                raise serializers.ValidationError(f'La somme totale doit être égale à {total}')
        return data