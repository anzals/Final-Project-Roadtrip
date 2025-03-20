from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Trip
from .models import RoadtripUser

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
    class Meta:
        model = Trip
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}} # Ensures author is set automatically
