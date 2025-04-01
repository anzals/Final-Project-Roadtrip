from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics, status, serializers
from .serializers import UserSerializer, TripSerializer, RouteSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Trip, RoadtripUser, Route
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response


class TripListCreate(generics.ListCreateAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]  # Ensures only logged-in users can access

    def get_queryset(self):
        user = self.request.user
        return Trip.objects.filter(author=user)  # Users only see their own trips

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)  # Automatically assigns logged-in user as author
        else:
            print(serializer.errors)


class TripDelete(generics.DestroyAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Trip.objects.filter(author=user)  # Users can only delete their own trips


class CreateUserView(generics.CreateAPIView):
    queryset = RoadtripUser.objects.all()  # Use CustomUser instead of User
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Anyone can register a new user

class TripDetailView(RetrieveAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

class RouteListCreate(generics.ListCreateAPIView):
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Route.objects.filter(trip__author=user)

    def perform_create(self, serializer):
        trip_id = self.request.data.get("trip")
        try:
            trip = Trip.objects.get(id=trip_id, author=self.request.user)
            # Use update_or_create to handle both creation and update
            route, created = Route.objects.update_or_create(
                trip=trip,
                defaults={
                    "startLocation": self.request.data.get("startLocation"),
                    "destination": self.request.data.get("destination"),
                    "distance": self.request.data.get("distance"),
                    "duration": self.request.data.get("duration"),
                    "routePath": self.request.data.get("routePath"),
                },
            )
            if created:
                return Response({"message": "Route created successfully"}, status=status.HTTP_201_CREATED)
            else:
                return Response({"message": "Route updated successfully"}, status=status.HTTP_200_OK)
        except Trip.DoesNotExist:
            raise serializers.ValidationError("Trip not found or not owned by the user.")

class RouteDetailView(generics.RetrieveAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticated]