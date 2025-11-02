#!/bin/bash
set -e

# Wait for postgres
echo "Waiting for postgres..."
while ! nc -z postgres 5432; do
  sleep 0.1
done
echo "Postgres is up!"

# Change to Source directory
cd /app/Source

# Run migrations
echo "Running migrations..."
python manage.py migrate --noinput

# Start server
echo "Starting server..."
python manage.py runserver 0.0.0.0:8000

