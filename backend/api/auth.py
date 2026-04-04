import jwt
import os
from django.contrib.auth.models import User
from rest_framework import authentication
from rest_framework import exceptions

class SupabaseAuth(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        try:
            # Format: Bearer <token>
            token = auth_header.split(' ')[1]
            payload = jwt.decode(
                token, 
                os.getenv('SUPABASE_JWT_SECRET'), 
                algorithms=["HS256"], 
                audience="authenticated"
            )
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token expired')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')
        except Exception as e:
            raise exceptions.AuthenticationFailed(str(e))

        # Map Supabase User to Django User
        supabase_id = payload.get('sub')
        email = payload.get('email')
        
        # Get or create local user
        user, created = User.objects.get_or_create(
            username=supabase_id, # Use sub as username for uniqueness
            defaults={'email': email}
        )
        
        return (user, None)
