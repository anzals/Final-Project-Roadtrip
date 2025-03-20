from django.urls import path
from .views import TripDetailView
from . import views

# defines api endpoints

urlpatterns = [
    path("trips/", views.TripListCreate.as_view(), name="trip-list"),
    path("trips/<int:pk>/", TripDetailView.as_view(), name="trip-detail"),
    path("trips/delete/<int:pk>/", views.TripDelete.as_view(), name="delete-trip"),
]