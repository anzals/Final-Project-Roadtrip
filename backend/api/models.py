from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.conf import settings

class Trip(models.Model):
    title = models.CharField(max_length=100) # short title for Trip
    content = models.TextField() # the content of the Trip
    created_at = models.DateTimeField(auto_now_add=True) # automatically sets the timestamp for when the trip was created
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="trips") 

    def __str__(self):
        return self.title

class RoadtripUserManager(BaseUserManager):
    def create_user(self, email, password=None, first_name="", last_name="", **extra_fields):
        """Creates and returns a regular user with only an email."""
        if not email:
            raise ValueError("The Email field must be set")
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
    is_staff = models.BooleanField(default=False)  # Allows Django Admin access if needed

    objects = RoadtripUserManager()

    USERNAME_FIELD = "email"  # Only email is used for login
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"