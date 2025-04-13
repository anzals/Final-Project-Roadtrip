from django.urls import path
from .views import TripDetailView, RouteListCreate, RouteDetailView, AddPitstopView, UpdateRouteView, UserProfileView, ChangePasswordView, DeleteAccountView, TripCollaboratorsView, GetUserByIdView
from . import views

# defines api endpoints

urlpatterns = [
    path("trips/", views.TripListCreate.as_view(), name="trip-list"),
    path("trips/<int:pk>/", TripDetailView.as_view(), name="trip-detail"),
    path("trips/delete/<int:pk>/", views.TripDelete.as_view(), name="delete-trip"),
    path("routes/", RouteListCreate.as_view(), name="route-list"),
    path("routes/<int:pk>/", RouteDetailView.as_view(), name="route-detail"),
    path("routes/<int:trip_id>/add-pitstop/", AddPitstopView.as_view(), name="add-pitstop"),
    path("routes/<int:trip_id>/update/", UpdateRouteView.as_view(), name="update-route"),
    path("user/profile/", UserProfileView.as_view(), name="user-profile"),
    path("user/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("user/delete/", DeleteAccountView.as_view(), name="delete-account"),
    path('trip/<int:trip_id>/collaborators/', TripCollaboratorsView.as_view(), name='trip-collaborators'),
    path('user/<int:pk>/', GetUserByIdView.as_view(), name='get-user-by-id'),
]