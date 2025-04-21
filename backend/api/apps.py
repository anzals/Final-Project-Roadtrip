# This code was reused from: https://github.com/techwithtim/Django-React-Full-Stack-App/blob/main/backend/api/apps.py
# Author: techwithtim

from django.apps import AppConfig

# Configuration for the 'api' Django app.
class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'
