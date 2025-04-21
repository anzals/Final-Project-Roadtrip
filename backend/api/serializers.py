from rest_framework import serializers
from .models import Trip, Route, RoadtripUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate

# Code adopted from 
# Title: Django & React Web App Tutorial - Authentication, Databases, Deployments & More...
# Author: Tech With Tim
# Youtube link: https://www.youtube.com/watch?v=c-QsfbznSXI&t=7203s
# Lines specified below

# Serializers convert Django models to JSON, which APIs communicate with.

# Provides serailization for user registration and profile updates.
# Code inspired by Tech With Tim Video - Line 17 - 34
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadtripUser  
        fields = ["id", "email", "first_name", "last_name", "password"]
        extra_kwargs = {
            "password": {"write_only": True},  # Prevents password from being exposed.
            "email": {"required": True},  # Ensures email, first name and last name are required during registration.
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    # Overrides the create method for custom user creation logic.
    def create(self, validated_data):
        if "first_name" not in validated_data or "last_name" not in validated_data:
            raise serializers.ValidationError("First name and last name are required for registration.")
        
        user = RoadtripUser.objects.create_user(**validated_data)  
        return user

# The rest of the code was following a similar template from what I learnt in the.
# Provides basic collaborator information for use in trip views. 
class CollaboratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadtripUser
        fields = ['id', 'email', 'first_name', 'last_name']

# Provides serialization for trip objects, including author, collaborators and route status indicators.
class TripSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True) # Author is automaitcally assigned and cannot be changed.
    collaborators = CollaboratorSerializer(many=True, read_only=True) # Collaborators cannot be modified from the serializer.
    has_route = serializers.SerializerMethodField() # Returns True if a route exists for a trip.
    has_updated_route = serializers.SerializerMethodField() # Returns True if the Route has been updated.

    class Meta:
        model = Trip
        fields = ["id", "title", "start_location", "destination", "trip_date", "created_at", "author", "collaborators", "has_route", "has_updated_route"]
        extra_kwargs = {"author": {"read_only": True}} # Ensures author is set automatically
    
    def get_has_route(self, obj):
        # Check if a route exists in the Route table with a matching trip_id.
        return Route.objects.filter(trip_id=obj.id).exists()
    
    def get_has_updated_route(self, obj):
        # Check if a route exists and the 'updated_at' field indicates an update
        route = Route.objects.filter(trip_id=obj.id).first()
        return bool(route and route.updated_at)

# Serializes route data including trip locations, distance, durations, pitstops and petrol costs information.
class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ["trip", "start_location", "destination", "distance", "duration", "route_path", "pitstops", "petrol_cost", "passenger_shares", "created_at", "updated_at"]
        extra_kwargs = {
            "route_path": {"required": False}, # These fields are all optional
            "pitstops": {"required": False},
            "passenger_shares": {"required": False},
            "petrol_cost": {"required": False}}  

# Custom login serializer that provide clearer error messages when login fails.
class LoginSerializerWithFeedback(TokenObtainPairSerializer):

    # Overrides the default validate method to return more detailed login feedback.
    def validate(self, attrs):
        try:
            RoadtripUser.objects.get(email=attrs['email']) # Checks if the email is registered
        except RoadtripUser.DoesNotExist:
            raise AuthenticationFailed("Invalid login credentials.")

        user = authenticate(email=attrs['email'], password=attrs['password']) # Verifies credentials
        if not user:
            raise AuthenticationFailed("Invalid login credentials.")

        return super().validate(attrs)
