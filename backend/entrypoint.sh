#!/bin/sh

# PostgreSQL'in hazır olmasını bekle
echo "Waiting for PostgreSQL to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done
echo "PostgreSQL is ready!"

# Migration'ları çalıştır
echo "Running database migrations..."
npx prisma db push

# Seed datasını ekle
echo "Seeding database..."
npx prisma db seed

# Komutu çalıştır (docker-compose'dan gelen command'ı ezmemek için)
echo "Starting application with: $@"
exec "$@"
