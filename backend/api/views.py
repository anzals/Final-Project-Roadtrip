from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, NoteSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Note, CustomUser


class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]  # Ensures only logged-in users can access

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)  # Users only see their own notes

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)  # Automatically assigns logged-in user as author
        else:
            print(serializer.errors)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Note.objects.filter(author=user)  # Users can only delete their own notes


class CreateUserView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()  # Use CustomUser instead of User
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Anyone can register a new user