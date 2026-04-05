import os
import django
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Developer, User

print("--- Users ---")
for user in User.objects.all():
    print(f"ID: {user.id}, Username: {user.username}, Email: {user.email}")

print("\n--- Developers ---")
for dev in Developer.objects.all():
    print(f"ID: {dev.id}, User: {dev.user.username}, Username Field: {dev.username}, Full Name: {dev.full_name}")
