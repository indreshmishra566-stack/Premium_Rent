FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PORT=8000

WORKDIR /app

# System dependencies for psycopg2 and healthchecks.
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

# Collect static assets at build time so the image is ready to serve.
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Migrate, seed, then start gunicorn. Honors $PORT for platforms like Render.
CMD ["sh", "-c", "python manage.py migrate --noinput && (python manage.py seed_cars || true) && gunicorn backend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3 --access-logfile -"]
