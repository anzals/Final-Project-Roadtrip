from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, TripSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Trip, RoadtripUser
from rest_framework.generics import RetrieveAPIView


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