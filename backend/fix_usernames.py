import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'portfolio_backend.settings')
django.setup()

from api.models import Developer, User

# Fix User 1 (dudev)
try:
    user1 = User.objects.get(username='dudev')
    dev1, created = Developer.objects.get_or_create(user=user1)
    if dev1.username != 'dudev':
        print(f"Updating dev1 username from {dev1.username} to dudev")
        dev1.username = 'dudev'
        dev1.save()
except User.DoesNotExist:
    print("User dudev not found")

# Fix User duvanhieu1 if it exists
try:
    user2 = User.objects.get(username='duvanhieu1')
    dev2, created = Developer.objects.get_or_create(user=user2)
    if dev2.username != 'duvanhieu1':
        print(f"Updating dev2 username from {dev2.username} to duvanhieu1")
        dev2.username = 'duvanhieu1'
        dev2.save()
except User.DoesNotExist:
    # Maybe check by email?
    print("User duvanhieu1 not found by username")

print("Done fixing usernames")
