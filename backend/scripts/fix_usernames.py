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

# Fix User 2 (test_dudev4) if it's supposed to be duvanhieu1
# Actually, I'll just check if there's any user with email duvanhieu1@gmail.com
try:
    user_dv = User.objects.get(email__icontains='duvanhieu1')
    dev_dv, created = Developer.objects.get_or_create(user=user_dv)
    if dev_dv.username != 'duvanhieu1':
        print(f"Updating developer for {user_dv.email} to username 'duvanhieu1'")
        dev_dv.username = 'duvanhieu1'
        dev_dv.save()
except User.DoesNotExist:
    print("No user with email duvanhieu1 found")

print("Fixing complete.")
