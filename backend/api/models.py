from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.conf import settings

class Trip(models.Model):
    title = models.CharField(max_length=100) 
    start_location = models.CharField(max_length=255)  
    destination = models.CharField(max_length=255)  
    trip_date = models.DateField()  
    created_at = models.DateTimeField(auto_now_add=True) 
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="trips")
    collaborators = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name="collaborated_trips", blank=True)
    
    def __str__(self):
        return self.title
    
    def is_user_allowed(self, user):
        return user == self.author or user in self.collaborators.all()
    
class Route(models.Model):
    trip = models.OneToOneField(Trip, on_delete=models.CASCADE, primary_key=True, related_name="route")  # Same ID as trip if overwritten
    start_location = models.CharField(max_length=255)  
    destination = models.CharField(max_length=255)  
    distance = models.CharField(max_length=50)  
    duration = models.CharField(max_length=50)  
    route_path = models.JSONField(default=list)  # better as a JSONField for waypoints allows for better performance
    pitstops = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)  
    updated_at = models.DateTimeField(auto_now=True)  

    def __str__(self):
        return f"Route for {self.trip.title} - {self.distance}, {self.duration}"

class RoadtripUserManager(BaseUserManager):
    def create_user(self, email, password=None, first_name=None, last_name=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        if not first_name:
            raise ValueError("First name is required")
        if not last_name:
            raise ValueError("Last name is required")

        email = self.normalize_email(email)
        user = self.model(email=email, first_name=first_name, last_name=last_name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

class RoadtripUser(AbstractBaseUser):
    email = models.EmailField(unique=True)  # Use email as the only identifier
    first_name = models.CharField(max_length=30, blank=True, null=True)  
    last_name = models.CharField(max_length=30, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    objects = RoadtripUserManager()

    USERNAME_FIELD = "email"  # Only email is used for login
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"