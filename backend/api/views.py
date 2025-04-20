from django.shortcuts import get_object_or_404
from rest_framework import generics, status, serializers, permissions
from .serializers import UserSerializer, TripSerializer, RouteSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Trip, RoadtripUser, Route
from rest_framework.generics import RetrieveAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import LoginSerializerWithFeedback, CollaboratorSerializer
import json
from django.core.mail import send_mail
from django.db import models

# Lists all trips the user owns or collaborates on, and allows the creation of a new trip.
class TripListCreate(generics.ListCreateAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]  # Ensures only logged-in users can access

    # Filters trips where the user is the author or a collaborator of a trip
    def get_queryset(self):
        user = self.request.user
        return Trip.objects.filter(models.Q(author=user) | models.Q(collaborators=user)).distinct()
    
    # Automatically assigns logged-in user as author
    def perform_create(self, serializer):
            serializer.save(author=self.request.user)  

# Deletes a trip completely if the user is the author, removes it from their view if they are a collaborator.
class TripDelete(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            trip = get_object_or_404(Trip, pk=pk)
            user = request.user

            if trip.author == user:
                trip.delete()
                return Response(status=204)

            elif user in trip.collaborators.all():
                trip.collaborators.remove(user)
                return Response({"message": "Trip removed from your dashboard."}, status=200)

            else:
                return Response({"detail": "You do not have permission to delete this trip."}, status=403)

        except Exception as e:
            return Response({"error": str(e)}, status=500)


# Allows anyone to register an account and sends a welcome email
class CreateUserView(generics.CreateAPIView):
    queryset = RoadtripUser.objects.all()  # Creates a user using the custom RoadtripUser model
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Anyone can register a new user

    def perform_create(self, serializer):
        user = serializer.save()
        
        # Send welcome email
        send_mail(
            subject="Welcome to Roadtrip Mate!",
            message=f"""
            Hi {user.first_name}, 

            Welcome to Roadtrip Mate!
            We are here to help you plan unforgettable road trips across the UK.

            Happy travels,
            – The Roadtrip Mate Team 🚐💨""",
            from_email=None, 
            recipient_list=[user.email],
            fail_silently=False,
        )

# Users can view or update their own profile information.
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

# After verifying their current password, users can change their password.
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
    
# Permenantly deletes user's account.
class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Authenticated users can retrieve, update or delete a trip by Id.
class TripDetailView(RetrieveUpdateDestroyAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

# Lists all the routes where the user is trip author. Also allows creating or updating a route for a trip.
class RouteListCreate(generics.ListCreateAPIView):
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Route.objects.filter(trip__author=user)

    def perform_create(self, serializer):
        trip_id = self.request.data.get("trip")
        try:
            trip = get_object_or_404(Trip, id=trip_id)
            if not trip.is_user_allowed(self.request.user):
                raise serializers.ValidationError("You do not have permission to edit this trip's route.")

            # Use update_or_create to handle both creation and update
            route, created = Route.objects.update_or_create(
                trip=trip,
                defaults={
                    "start_location": self.request.data.get("start_location"),
                    "destination": self.request.data.get("destination"),
                    "distance": self.request.data.get("distance"),
                    "duration": self.request.data.get("duration"),
                    "route_path": self.request.data.get("route_path"),
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

class RouteByTripIdView(generics.RetrieveAPIView):
    serializer_class = RouteSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        trip_id = self.kwargs.get('trip_id')
        try:
            return Route.objects.get(trip_id=trip_id)
        except Route.DoesNotExist:
            raise serializers.ValidationError("Route not found")


class AddPitstopView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, trip_id):
        try:
            # Fetch the route object for the given trip ID or return 404 if not found
            route = get_object_or_404(Route, trip_id=trip_id)
            if not route.trip.is_user_allowed(request.user):
                return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

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
            if not route.trip.is_user_allowed(request.user):
                return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

            # Update the route details
            route.distance = request.data.get("distance", route.distance)
            route.duration = request.data.get("duration", route.duration)
            route.route_path = request.data.get("route_path", route.route_path)
            route.pitstops = request.data.get("pitstops", route.pitstops)
            route.petrol_cost = request.data.get("petrol_cost", route.petrol_cost)
            route.passenger_shares = request.data.get("passenger_shares", route.passenger_shares)

            route.save()

            return Response({"message": "Route updated successfully"}, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error updating route: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginViewWithFeedback(TokenObtainPairView):
    serializer_class = LoginSerializerWithFeedback

class GetUserByIdView(RetrieveAPIView):
    queryset = RoadtripUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class TripCollaboratorsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, trip_id):
        try:
            trip = get_object_or_404(Trip, id=trip_id)
            
            if not trip.is_user_allowed(request.user):
                return Response({'detail': 'Not authorized'}, status=403)

            collaborators = trip.collaborators.all()
            
            return Response({
                'status': 'success',
                'data': {
                    'owner': {
                        'id': trip.author.id,
                        'email': trip.author.email,
                        'first_name': trip.author.first_name,
                        'last_name': trip.author.last_name
                    },
                    'collaborators': CollaboratorSerializer(collaborators, many=True).data,
                    'current_user_is_owner': request.user.id == trip.author.id
                }
            })
        except Exception as e:
            return Response({
                'status': 'error',
                'message': str(e)
            }, status=500)

    def post(self, request, trip_id):
        trip = get_object_or_404(Trip, id=trip_id)
        
        if request.user != trip.author:
            return Response(
                {'detail': 'Only the trip owner can add collaborators'}, 
                status=403
            )
        
        email = request.data.get('email')
        if not email:
            return Response(
                {'detail': 'Email is required'}, 
                status=400
            )

        try:
            user_to_add = RoadtripUser.objects.get(email=email)
            if trip.collaborators.filter(id=user_to_add.id).exists():
                return Response(
                    {'detail': 'User is already a collaborator'},
                    status=400
                )
            
            trip.collaborators.add(user_to_add)
            send_mail(
                subject=f"You've been added to a trip on Roadtrip Mate!",
                message=(
                    f"Hi {user_to_add.first_name},\n\n"
                    f"You’ve been added as a collaborator to the trip \"{trip.title}\" "
                    f"by {trip.author.first_name} {trip.author.last_name}.\n\n"
                    "Log in to view and help plan the route:\n"
                    "Happy travels! 🚗💨"
                    ),
                    from_email=None,
                    recipient_list=[user_to_add.email],
                    fail_silently=False,
            )
            
            return Response(
                {'status': 'success', 'message': 'Collaborator added and notified via email'},
                status=200
            )
        except RoadtripUser.DoesNotExist:
            return Response(
                {'detail': 'User not found.'},
                status=404
            )

    def delete(self, request, trip_id):
        trip = get_object_or_404(Trip, id=trip_id)

        if request.user != trip.author:
            return Response({'detail': 'Only the trip owner can remove collaborators'}, status=403)

        email = request.data.get('email')
        if not email:
            return Response({'detail': 'Email is required'}, status=400)

        try:
            user_to_remove = RoadtripUser.objects.get(email=email)
        except RoadtripUser.DoesNotExist:
            return Response({'detail': 'User not found'}, status=404)

        trip.collaborators.remove(user_to_remove)
        return Response({'detail': 'Collaborator removed successfully'}, status=200)
