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
from dotenv import load_dotenv
load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv('SECRET_KEY')

ENVIRONNEMENT = 'DEV'

# SECURITY WARNING: don't run with debug turned on in production!
if ENVIRONNEMENT == 'DEV':
    DEBUG = True
else:
    DEBUG = False #we will turn debug to false in a prod or other environments


ALLOWED_HOSTS = ['*']



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



if ENVIRONNEMENT == 'DEV':
    DATABASES = {
        'default': {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': os.getenv('NAME_For_Dev'),
            'USER': os.getenv('USER_For_Dev'),
            'PASSWORD': os.getenv('PASSWORD_For_Dev'),
            'HOST': os.getenv('HOST_For_Dev'),
            'PORT': os.getenv('PORT_For_Dev'),
        }
    }
    
elif ENVIRONNEMENT == 'REC':
    DATABASES = {
        'default': {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': os.getenv('NAME_For_Rec'),
            'USER': os.getenv('USER_For_Rec'),
            'PASSWORD': os.getenv('PASSWORD_For_Rec'),
            'HOST': os.getenv('HOST_For_Rec'),
            'PORT': os.getenv('PORT_For_Rec'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'NAME': os.getenv('NAME_For_Prod'),
            'USER': os.getenv('USER_For_Prod'),
            'PASSWORD': os.getenv('PASSWORD_For_Prod'),
            'HOST': os.getenv('HOST_For_Prod'),
            'PORT': os.getenv('PORT_For_Prod'),
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

