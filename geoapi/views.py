from django.shortcuts import render
from django.http import JsonResponse
from .models import Lamp, Lamp_historique
from rest_framework import generics
from .serializer import LampSerializer, Lamp_historiqueSerializer
from rest_framework.views import APIView
from rest_framework.response import Response

class LampView(APIView):
    def get(self, request):
        queryset = Lamp.objects.all()
        serializer = LampSerializer(queryset, many=True)
        return Response(serializer.data, status=200)
    def post(self, request):
        serializer = LampSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=200)

class LampDetailsHistorique(APIView):
    def get(self, request, pk):
        queryset = Lamp_historique.objects.filter(lamp__id=pk).order_by('-created_At')
        if len(queryset) > 4:
            queryset = queryset[0:4]
        serializer = Lamp_historiqueSerializer(queryset, many=True)
        return Response(serializer.data, status=200)

    def post(self, request, pk):
        serializer = Lamp_historiqueSerializer(data=request.data)
        print(request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=200)
        
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.core import serializers
import json
class NerestLamp(APIView):
    def get(self, request):
        lat = request.query_params.get('lat')
        long = request.query_params.get('long')
        pnt = Point(float(long), float(lat), srid=4326)
        querysets = Lamp.objects.annotate(distance=Distance('coord_X_Y',pnt)).order_by('distance').values('id','name','station','distance')[0:3]
        data = []
        for queryset in querysets:
            data.append({"id":queryset['id'], "name":queryset['name'], "station":queryset['station'],'distance':transformDistanceValueToFloat(queryset['distance'])})
        return Response(json.dumps(data), status=200)

def transformDistanceValueToFloat(value):
    distance = str(value)
    return float(distance.split(' ')[0]) # we dont need the m meter 

def welcomeapp(request):
    return render(request, 'mainPage1.html')