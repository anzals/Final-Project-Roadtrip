from rest_framework import serializers
from .models import Trip, Route, RoadtripUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate


# Serializers act as a bridge, converting Django models (python objects) to JSON which APIs communicate with.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadtripUser  
        fields = ["id", "email", "first_name", "last_name", "password"]
        extra_kwargs = {
            "password": {"write_only": True},  # Prevents password from being exposed
            "email": {"required": True},  # Ensure email is required
            "first_name": {"required": False},
            "last_name": {"required": False},
        }

    def create(self, validated_data):
        if "first_name" not in validated_data or "last_name" not in validated_data:
            raise serializers.ValidationError("First name and last name are required for registration.")
        
        user = RoadtripUser.objects.create_user(**validated_data)  
        return user

class TripSerializer(serializers.ModelSerializer):
    has_route = serializers.SerializerMethodField()
    has_updated_route = serializers.SerializerMethodField()

    class Meta:
        model = Trip
        fields = ["id", "title", "startLocation", "destination", "tripDate", "created_at", "author", "has_route", "has_updated_route"]
        extra_kwargs = {"author": {"read_only": True}} # Ensures author is set automatically
    
    def get_has_route(self, obj):
        # Check if a route exists in the Route table with a matching trip_id.
        return Route.objects.filter(trip_id=obj.id).exists()
    
    def get_has_updated_route(self, obj):
    # Check if a route exists and the 'updated_at' field indicates an update
        route = Route.objects.filter(trip_id=obj.id).first()
        return bool(route and route.updated_at)


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ["trip", "startLocation", "destination", "distance", "duration", "routePath", "pitstops", "created_at", "updated_at"]
        extra_kwargs = {"routePath": {"required": False}}  # Allow the pitstop list to be empty

class LoginSerializerWithFeedback(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            RoadtripUser.objects.get(email=attrs['email'])
        except RoadtripUser.DoesNotExist:
            raise AuthenticationFailed("This email is not registered.")

        user = authenticate(email=attrs['email'], password=attrs['password'])
        if not user:
            raise AuthenticationFailed("Incorrect password.")

        return super().validate(attrs)