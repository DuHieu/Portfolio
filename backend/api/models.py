from django.db import models
from django.contrib.auth.models import User

class Developer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='developer_profile')
    username = models.CharField(max_length=100, unique=True, null=True, blank=True)
    full_name = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.username and self.user.email:
            # Tự động tạo username từ email (hieudu@gmail.com -> hieudu)
            base_username = self.user.email.split('@')[0]
            # Đảm bảo username là duy nhất
            if Developer.objects.filter(username=base_username).exists():
                base_username = f"{base_username}_{self.user.id}"
            self.username = base_username
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username or self.user.email

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

class Education(models.Model):
    developer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='education', null=True, blank=True)
    degree = models.CharField(max_length=200)
    school = models.CharField(max_length=200)
    period = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.degree} at {self.school} (by {self.developer.username if self.developer else 'Unknown'})"



class Skill(models.Model):
    CATEGORY_CHOICES = [
        ('frontend', 'Frontend'),
        ('backend', 'Backend'),
        ('devops', 'DevOps'),
        ('tools', 'Tools'),
        ('language', 'Language'),
        ('other', 'Other'),
    ]
    developer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='skills', null=True, blank=True)
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    level = models.IntegerField(default=80, help_text='Skill level from 0 to 100')
    icon = models.CharField(max_length=10, blank=True, help_text='Emoji icon e.g. ⚛️')
    order = models.IntegerField(default=0)

    class Meta:
        ordering = ['category', 'order']

    def __str__(self):
        return f"{self.name} ({self.category})"


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

# Signals to auto-create Developer profile
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_developer_profile(sender, instance, created, **kwargs):
    if created:
        Developer.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_developer_profile(sender, instance, **kwargs):
    if hasattr(instance, 'developer_profile'):
        instance.developer_profile.save()
    else:
        Developer.objects.create(user=instance)
