from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Note
from .models import CustomUser

# Serializers act as a bridge, converting Django models (python objects) to JSON which APIs communicate with.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email", "password"]
        extra_kwargs = {
            "password": {"write_only": True},  # Prevents password from being exposed
            "email": {"required": True}  # Ensure email is required
        }

    def create(self, validated_data):
        print(validated_data)
        user = CustomUser.objects.create_user(**validated_data)
        return user


class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {"author": {"read_only": True}} # Ensures author is set automatically
