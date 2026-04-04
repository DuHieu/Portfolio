import os
import re

path = 'd:\\MyProject\\Portfolio\\backend\\portfolio_backend\\settings.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update Imports
if 'import os' not in content:
    content = content.replace('from pathlib import Path', 'import os\nfrom pathlib import Path\nfrom dotenv import load_dotenv\n\n# Load .env file\nload_dotenv()')

# 2. Update SECURITY settings
content = re.sub(r"SECRET_KEY = '.*'", "SECRET_KEY = os.getenv('SECRET_KEY', 'django-insecure-p_0cz!(efmnivvcd!hog$cnaq%j719w*d8w)a9iko=anzlr*lx')", content)
content = content.replace('DEBUG = True', "DEBUG = os.getenv('DEBUG', 'True') == 'True'")
content = content.replace('ALLOWED_HOSTS = []', "ALLOWED_HOSTS = os.getenv('ALLOWED_HOST_LIST', 'localhost,127.0.0.1').split(',')")

# 3. Update DATABASES
db_pattern = r"DATABASES = \{.*?'default': \{.*?'ENGINE': 'django\.db\.backends\.sqlite3',.*?'NAME': BASE_DIR / 'db\.sqlite3',.*?\}\s*\}"
db_replacement = """DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', 'postgres'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}"""
content = re.sub(db_pattern, db_replacement, content, flags=re.DOTALL)

# 4. Integrate REST Framework with Supabase JWT (Custom Logic)
if 'REST_FRAMEWORK' not in content:
    content += """

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'api.auth.SupabaseAuth',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
}
"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Settings transformed successfully.")
