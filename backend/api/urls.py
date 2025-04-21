# The formating of the code is inspired from 
# Title: Django & React Web App Tutorial - Authentication, Databases, Deployments & More...
# Author: Tech With Tim
# Youtube link: https://www.youtube.com/watch?v=c-QsfbznSXI&t=7203s


from django.urls import path
from . import views

# defines api endpoints

urlpatterns = [
    path("trips/", views.TripListCreate.as_view(), name="trip-list"), # List or create trip
    path("trips/<int:pk>/", views.TripDetailView.as_view(), name="trip-detail"), # Retrieve, update or delete trips
    path("trips/delete/<int:pk>/", views.TripDelete.as_view(), name="delete-trip"), # Delete trip or remove from dashboard
    path("routes/", views.RouteListCreate.as_view(), name="route-list"), # List or create routes
    path("routes/<int:pk>/", views.RouteDetailView.as_view(), name="route-detail"), # Get route by Id
    path("api/routes/by-trip/<int:trip_id>/", views.RouteByTripIdView.as_view(), name="route-by-trip"), # Get route by trip Id
    path("routes/<int:trip_id>/add-pitstop/", views.AddPitstopView.as_view(), name="add-pitstop"), # Add pitstop to route
    path("routes/<int:trip_id>/update/", views.UpdateRouteView.as_view(), name="update-route"), # Update route details
    path("user/profile/", views.UserProfileView.as_view(), name="user-profile"), # View or update profile 
    path("user/change-password/", views.ChangePasswordView.as_view(), name="change-password"), # Change user password
    path("user/delete/", views.DeleteAccountView.as_view(), name="delete-account"), # Delete user account
    path('trip/<int:trip_id>/collaborators/', views.TripCollaboratorsView.as_view(), name='trip-collaborators'), # Manage trip collaborators
    path('user/<int:pk>/', views.GetUserByIdView.as_view(), name='get-user-by-id'), # Get user by id
]