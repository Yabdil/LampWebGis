"""
Django settings for lampProject project.

Generated by 'django-admin startproject' using Django 3.1.2.

For more information on this file, see
https://docs.djangoproject.com/en/3.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.1/ref/settings/
"""
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'a$n@_hsbe+i3^^mmh1!ewxj^^=1@xk-t5bh8h550^eak1=ekcz'

import json


ENVIRONNEMENT = 'PROD'

# SECURITY WARNING: don't run with debug turned on in production!
if ENVIRONNEMENT == 'DEV':
   DEBUG = True
else:
    DEBUG = False #we will turn debug to false in a prod or preprod env


ALLOWED_HOSTS = ['127.0.0.1','142.93.171.149']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'geoapi.apps.GeoapiConfig',
    'django.contrib.gis',
    'corsheaders',
    'rest_framework',
    'rest_framework_gis',
    'django_rename_app',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',


    'whitenoise.middleware.WhiteNoiseMiddleware',


    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',

]

ROOT_URLCONF = 'lampProject.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True, #Ici on dit a django d'aller chercher les templates au sein des applications
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'lampProject.wsgi.application'

CORS_ALLOW_ALL_ORIGINS = True


with open('lampProject/env.json') as file:
    env_file = json.load(file)['env']

if ENVIRONNEMENT == 'DEV':
    DATABASES = {
        'default': {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': env_file['DEV']['NAME'],
            'USER': env_file['DEV']['USER'],
            'PASSWORD': env_file['DEV']['PASSWORD'],
            'HOST': env_file['DEV']['HOST'],
            'PORT': env_file['DEV']['PORT'],
        }
    }
elif ENVIRONNEMENT == 'PREPROD':
    DATABASES = {
        'default': {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': env_file['PREPROD']['NAME'],
            'USER': env_file['PREPROD']['USER'],
            'PASSWORD': env_file['PREPROD']['PASSWORD'],
            'HOST': env_file['PREPROD']['HOST'],
            'PORT': env_file['PREPROD']['PORT'],
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': env_file['PROD']['NAME'],
            'USER': env_file['PROD']['USER'],
            'PASSWORD': env_file['PROD']['PASSWORD'],
            'HOST': env_file['PROD']['HOST'],
            'PORT': env_file['PROD']['PORT'],
        }
    }

# Password validation
# https://docs.djangoproject.com/en/3.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Europe/Berlin'

USE_I18N = True

USE_L10N = True

#USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.1/howto/static-files/
STATIC_ROOT = os.path.join(BASE_DIR, 'static/')

STATIC_URL = 'geoapi/static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'geoapi/static')
]

