import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.users.models import User

# Check if superuser exists, if not create
if not User.objects.filter(email='admin@example.com').exists():
    user = User.objects.create_superuser(email='admin@example.com', password='Admin123!')
    print("Created admin@example.com")
else:
    user = User.objects.get(email='admin@example.com')
    user.set_password('Admin123!')
    user.save()
    print("Updated admin@example.com")
