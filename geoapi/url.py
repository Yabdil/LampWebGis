from django.urls import path
from . import views
from .views import LampsView, LampDetailsHistorique

urlpatterns = [
    path('', views.openApp, name='openApp'),
    path('getGeojson', LampsView.as_view()),
    path('lamphistorique/<int:pk>', LampDetailsHistorique.as_view()),
    path('getNearestLamp/', views.nearestLamps)
    ]