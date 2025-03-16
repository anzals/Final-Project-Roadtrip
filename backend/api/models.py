from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.conf import settings

class Note(models.Model):
    title = models.CharField(max_length=100) # short title for Note
    content = models.TextField() # the content of the Note
    created_at = models.DateTimeField(auto_now_add=True) # automatically sets the timestamp for when the note was created
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notes") 

    def __str__(self):
        return self.title

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """Creates and returns a regular user with only an email."""
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Creates and returns a superuser."""
        extra_fields.setdefault("is_staff", True)  # Allows admin access
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser):
    email = models.EmailField(unique=True)  # Use email as the only identifier
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)  # Allows Django Admin access if needed

    objects = CustomUserManager()

    USERNAME_FIELD = "email"  # Only email is used for login
    REQUIRED_FIELDS = []  # No extra fields required

    def __str__(self):
        return self.email