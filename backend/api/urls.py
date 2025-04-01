from django.urls import path
from .views import TripDetailView, RouteListCreate, RouteDetailView
from . import views

# defines api endpoints

urlpatterns = [
    path("trips/", views.TripListCreate.as_view(), name="trip-list"),
    path("trips/<int:pk>/", TripDetailView.as_view(), name="trip-detail"),
    path("trips/delete/<int:pk>/", views.TripDelete.as_view(), name="delete-trip"),
    path("routes/", RouteListCreate.as_view(), name="route-list"),
    path("routes/<int:pk>/", RouteDetailView.as_view(), name="route-detail"),
]