from django.urls import path
from . import views
from .views import LampView, LampDetailsHistorique, NerestLamp

urlpatterns = [
    path('', views.welcomeapp, name='welcomeapp'),
    path('getGeojson', LampView.as_view()),
    path('lamphistorique/<int:pk>', LampDetailsHistorique.as_view()),
    path('getNearestLamp/', NerestLamp.as_view())
    ]