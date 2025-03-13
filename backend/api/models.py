from django.db import models
from django.contrib.auth.models import User


class Note(models.Model):
    title = models.CharField(max_length=100) # short title for Note
    content = models.TextField() # the content of the Note
    created_at = models.DateTimeField(auto_now_add=True) # automatically sets the timestamp for when the note was created
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notes") # links the note to the user that created 

    def __str__(self):
        return self.title