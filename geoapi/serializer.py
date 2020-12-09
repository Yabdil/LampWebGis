from  rest_framework_gis.serializers import GeoFeatureModelSerializer
from .models import Lamp, Lamp_historique
from rest_framework import serializers

class LampsSerializer(GeoFeatureModelSerializer):
    diff = serializers.SerializerMethodField()
    def get_diff(self,obj): # This method's goal is to get the recent maintenance for each lamp
        LampDiff = 0
        if Lamp_historique.objects.filter(lamp=obj).exists():
            lamp = Lamp_historique.objects.filter(lamp=obj).order_by('-created_At').first()
            LampDiff = lamp.number_off_lamp_On - lamp.number_off_lamp_Off      
        return LampDiff # if not existing by default we take 0
    class Meta:
        model = Lamp
        geo_field = "coord_X_Y"
        fields = '__all__'


class Lamp_Maintenances_Serializer(serializers.ModelSerializer):
    class Meta:
        model = Lamp_historique
        fields = '__all__'
        
    def validate(self, data):
        lamp = data['lamp']
        obj = Lamp_historique.objects.filter(lamp=lamp).order_by('created_At')
        if len(obj) > 0:
            total = obj.first().total
            if data['total'] != total:
                raise serializers.ValidationError(f'La somme totale doit être égale à {total}')
        return data