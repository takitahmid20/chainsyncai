#!/bin/sh
set -e

echo "========================================"
echo "ChainSync AI Backend - Starting..."
echo "========================================"

# Apply database migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

# Create superuser if env provided
if [ -n "$DJANGO_SUPERUSER_EMAIL" ] && [ -n "$DJANGO_SUPERUSER_PASSWORD" ] && [ -n "$DJANGO_SUPERUSER_USERNAME" ]; then
  echo "Creating superuser..."
  python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.filter(email='$DJANGO_SUPERUSER_EMAIL').exists() or User.objects.create_superuser(username='$DJANGO_SUPERUSER_USERNAME', email='$DJANGO_SUPERUSER_EMAIL', password='$DJANGO_SUPERUSER_PASSWORD')"
fi

echo "========================================"
echo "Starting Gunicorn server..."
echo "Workers: 4 | Port: ${PORT:-8000}"
echo "========================================"

# Start Gunicorn with optimized settings
exec gunicorn chainsync.wsgi:application \
  --bind 0.0.0.0:${PORT:-8000} \
  --workers 4 \
  --threads 2 \
  --worker-class sync \
  --worker-tmp-dir /dev/shm \
  --timeout 120 \
  --graceful-timeout 30 \
  --keep-alive 5 \
  --log-level info \
  --access-logfile - \
  --error-logfile - \
  --capture-output
