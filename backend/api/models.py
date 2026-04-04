from django.db import models
from django.contrib.auth.models import User

class Project(models.Model):
    developer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects', null=True, blank=True)
    title = models.CharField(max_length=200)
    description = models.TextField()
    tags = models.JSONField(help_text='List of tags like ["React", "Django"]')
    gradient = models.CharField(max_length=100, default='from-[#00D9FF] to-[#0088CC]')
    size = models.CharField(max_length=50, default='medium', choices=[('small', 'Small'), ('medium', 'Medium'), ('large', 'Large')])
    url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} (by {self.developer.username if self.developer else 'Unknown'})"


class Experience(models.Model):
    developer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='experiences', null=True, blank=True)
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200)
    period = models.CharField(max_length=100)
    description = models.TextField()
    skills = models.JSONField(help_text='List of skills')
    is_active = models.BooleanField(default=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.title} at {self.company} (by {self.developer.username if self.developer else 'Unknown'})"


class ContactMessage(models.Model):
    # Contact messages can also be routed to a specific dev
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages', null=True, blank=True)
    name = models.CharField(max_length=200)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Message to {self.receiver.username if self.receiver else 'General'} from {self.name}"
