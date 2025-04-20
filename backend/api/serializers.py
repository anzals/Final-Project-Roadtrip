from rest_framework import serializers
from .models import Trip, Route, RoadtripUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate


# Serializers convert Django models to JSON which APIs communicate with.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadtripUser  
        fields = ["id", "email", "first_name", "last_name", "password"]
        extra_kwargs = {
            "password": {"write_only": True},  # Prevents password from being exposed
            "email": {"required": True},  # Ensure email is required
            "first_name": {"required": True},
            "last_name": {"required": True},
        }

    def create(self, validated_data):
        if "first_name" not in validated_data or "last_name" not in validated_data:
            raise serializers.ValidationError("First name and last name are required for registration.")
        
        user = RoadtripUser.objects.create_user(**validated_data)  
        return user

class CollaboratorSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoadtripUser
        fields = ['id', 'email', 'first_name', 'last_name']

class TripSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    collaborators = CollaboratorSerializer(many=True, read_only=True)
    has_route = serializers.SerializerMethodField()
    has_updated_route = serializers.SerializerMethodField()

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


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ["trip", "start_location", "destination", "distance", "duration", "route_path", "pitstops", "petrol_cost", "passenger_shares", "created_at", "updated_at"]
        extra_kwargs = {
            "route_path": {"required": False}, 
            "pitstops": {"required": False},
            "passenger_shares": {"required": False},
            "petrol_cost": {"required": False}}  

class LoginSerializerWithFeedback(TokenObtainPairSerializer):
    def validate(self, attrs):
        try:
            RoadtripUser.objects.get(email=attrs['email'])
        except RoadtripUser.DoesNotExist:
            raise AuthenticationFailed("Invalid login credentials.")

        user = authenticate(email=attrs['email'], password=attrs['password'])
        if not user:
            raise AuthenticationFailed("Invalid login credentials.")

        return super().validate(attrs)
