import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio_backend.settings')
django.setup()

from api.models import Developer, User

print("--- Users ---")
for u in User.objects.all():
    print(f"ID: {u.id}, Username: {u.username}, Email: {u.email}")

print("\n--- Developers ---")
for d in Developer.objects.all():
    print(f"ID: {d.id}, User: {d.user.username}, Dev Username: {d.username}")
