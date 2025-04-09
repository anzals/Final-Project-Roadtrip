from django.shortcuts import render, get_object_or_404
from rest_framework import generics, status, serializers
from .serializers import UserSerializer, TripSerializer, RouteSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Trip, RoadtripUser, Route
from rest_framework.generics import RetrieveAPIView, UpdateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import LoginSerializerWithFeedback
import json
from django.core.mail import send_mail

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

    def perform_create(self, serializer):
        user = serializer.save()
        
        # Send welcome email
        send_mail(
            subject="Welcome to Roadtrip Mate!",
            message=f"""
            Hi {user.first_name}, 

            Welcome to **Roadtrip Mate** — your new travel buddy for planning unforgettable road trips across the UK!

            Please verify your email to activate your account:  https://to be made


            Happy travels,
            – The Roadtrip Mate Team 🚐💨""",
            from_email=None, 
            recipient_list=[user.email],
            fail_silently=False,
        )


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
        }, status=status.HTTP_200_OK)

    def patch(self, request):
        user = request.user
        serializer = UserSerializer(user, data=request.data, partial=True)  # Partial update
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not user.check_password(current_password):
            return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 8:
            return Response({"error": "New password must be at least 8 characters long."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password updated successfully!"}, status=status.HTTP_200_OK)
    
class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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

class AddPitstopView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, trip_id):
        try:
            # Fetch the route object for the given trip ID or return 404 if not found
            route = get_object_or_404(Route, trip_id=trip_id)

            pitstop = request.data.get("pitstop")
            if not pitstop:
                return Response({"error": "Pitstop is required"}, status=status.HTTP_400_BAD_REQUEST)

            # Ensure pitstops is a list before appending
            if not isinstance(route.pitstops, list):
                try:
                    # Convert the JSONB string to a Python list if necessary
                    route.pitstops = json.loads(route.pitstops) if route.pitstops else []
                except (TypeError, json.JSONDecodeError):
                    # If parsing fails, initialize with an empty list
                    route.pitstops = []

            # Append the new pitstop only if it's not already in the list
            if pitstop not in route.pitstops:
                route.pitstops.append(pitstop)

            # Save the updated pitstops as a list, not as a JSON string
            route.pitstops = route.pitstops
            route.save()

            return Response({"message": "Pitstop added successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error adding pitstop: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class UpdateRouteView(generics.UpdateAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticated]

    def patch(self, request, trip_id):
        try:
            route = get_object_or_404(Route, trip_id=trip_id)

            # Update the route details
            route.distance = request.data.get("distance", route.distance)
            route.duration = request.data.get("duration", route.duration)
            route.routePath = request.data.get("routePath", route.routePath)
            route.pitstops = request.data.get("pitstops", route.pitstops)
            route.save()

            return Response({"message": "Route updated successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error updating route: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginViewWithFeedback(TokenObtainPairView):
    serializer_class = LoginSerializerWithFeedback